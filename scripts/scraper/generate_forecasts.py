"""
Generate a single self-contained HTML report showing Facebook Prophet price
forecasts for every item in prophet_data/, so you can see predicted prices
for the next month across all items in one page.

This is the 4th and final step of the pipeline:
    1. download_pdfs.py        -> PDFs/<year>/<month>/<date>.pdf
    2. batch_process_pdfs.py   -> price_data/<item>.json
    3. prepare_prophet_data.py -> prophet_data/<item>.csv
    4. generate_forecasts.py   -> forecast_report.html   (this script)

For each item CSV:
  - Fits a Prophet model on the historical ds/y series.
  - Forecasts --days (default 30) days past the last known date.
  - Both the historical and the forecast portions of the chart show a PRICE
    RANGE, not just a single average line:
      - Historical: the actual reported min_price/max_price band (shaded)
        with the average (y) as a line on top.
      - Forecast: Prophet's native yhat_lower/yhat_upper uncertainty band
        (--interval-width, default 0.90 = 90%) with the predicted average
        (yhat) as a line on top. This is the recommended approach discussed
        earlier - not a separate min/max model.
    Any extra metadata columns in the CSV (item, category, market, unit,
    min_price, max_price, average_computed) are read only for labeling/range
    shading; Prophet itself only ever sees ds/y.

All items are rendered as a grid of interactive charts on one page. Hovering
anywhere on a chart shows the exact date plus the actual or predicted price
range at that point (hover mode is "x unified", so both series line up in one
tooltip). Each card has a "View large" (⤢) button that opens that chart in a
big modal dialog (click outside it, press Escape, or hit the X to close). A
text box at the top filters cards by item name (handy once you have 60+
items).

Usage:
    python generate_forecasts.py ../prophet_data --output ../forecast_report.html
    python generate_forecasts.py ../prophet_data --output ../forecast_report.html --days 60
"""

import argparse
import sys
from pathlib import Path

import pandas as pd
import plotly.graph_objects as go
import plotly.io as pio

CHART_HEIGHT = 320


def load_item_csv(csv_path: Path) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    df["ds"] = pd.to_datetime(df["ds"])
    df["y"] = pd.to_numeric(df["y"], errors="coerce")
    for col in ("min_price", "max_price"):
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df.dropna(subset=["ds", "y"]).sort_values("ds").reset_index(drop=True)
    return df


def fit_and_forecast(df: pd.DataFrame, days: int, interval_width: float):
    # Imported lazily so --help / argument errors don't pay Prophet's
    # (slow-ish) import cost.
    from prophet import Prophet

    model = Prophet(interval_width=interval_width)
    # Prophet only reads columns literally named "ds" and "y" - any other
    # columns present are ignored, but we select explicitly anyway for clarity.
    model.fit(df[["ds", "y"]])
    future = model.make_future_dataframe(periods=days, freq="D")
    return model.predict(future)


def make_item_label(csv_path: Path, df: pd.DataFrame) -> str:
    """Prefer the metadata columns written by prepare_prophet_data.py; fall
    back to the filename if a CSV predates that change (still just ds/y)."""
    if {"item", "category", "market"}.issubset(df.columns) and len(df):
        row = df.iloc[-1]
        return f"{row['item']} ({row['category']}, {row['market']})"
    return csv_path.stem


def build_chart_html(label: str, df: pd.DataFrame, forecast: pd.DataFrame,
                      interval_width: float, div_id: str) -> str:
    fig = go.Figure()
    has_range = {"min_price", "max_price"}.issubset(df.columns) and df["min_price"].notna().all()

    # --- Historical actual range (min-max band) + average line ------------
    if has_range:
        hist_band_x = pd.concat([df["ds"], df["ds"][::-1]])
        hist_band_y = pd.concat([df["max_price"], df["min_price"][::-1]])
        fig.add_trace(go.Scatter(
            x=hist_band_x, y=hist_band_y, fill="toself", fillcolor="rgba(44,90,160,0.15)",
            line=dict(color="rgba(255,255,255,0)"), name="Actual range", hoverinfo="skip",
            showlegend=True,
        ))
        actual_customdata = df[["min_price", "max_price"]].to_numpy()
        actual_hovertemplate = (
            "%{x|%Y-%m-%d}<br>Actual avg: %{y:.2f}<br>"
            "Range: %{customdata[0]:.2f} – %{customdata[1]:.2f}<extra></extra>"
        )
    else:
        actual_customdata = None
        actual_hovertemplate = "%{x|%Y-%m-%d}<br>Actual avg: %{y:.2f}<extra></extra>"

    fig.add_trace(go.Scatter(
        x=df["ds"], y=df["y"], mode="lines+markers", name="Actual (avg)",
        line=dict(color="#2c5aa0", width=1.5), marker=dict(size=3, color="#2c5aa0"),
        customdata=actual_customdata, hovertemplate=actual_hovertemplate,
    ))

    # --- Forecast range (Prophet uncertainty band) + predicted avg line ---
    band_x = pd.concat([forecast["ds"], forecast["ds"][::-1]])
    band_y = pd.concat([forecast["yhat_upper"], forecast["yhat_lower"][::-1]])
    fig.add_trace(go.Scatter(
        x=band_x, y=band_y, fill="toself", fillcolor="rgba(230,126,34,0.18)",
        line=dict(color="rgba(255,255,255,0)"),
        name=f"Predicted range ({int(interval_width * 100)}%)", hoverinfo="skip",
    ))
    forecast_customdata = forecast[["yhat_lower", "yhat_upper"]].to_numpy()
    fig.add_trace(go.Scatter(
        x=forecast["ds"], y=forecast["yhat"], mode="lines", name="Forecast (avg)",
        line=dict(color="#e67e22", width=2),
        customdata=forecast_customdata,
        hovertemplate=(
            "%{x|%Y-%m-%d}<br>Predicted avg: %{y:.2f}<br>"
            "Predicted range: %{customdata[0]:.2f} – %{customdata[1]:.2f}<extra></extra>"
        ),
    ))

    fig.update_layout(
        title=dict(text=label, font=dict(size=13)),
        margin=dict(l=45, r=15, t=35, b=30),
        height=CHART_HEIGHT, template="plotly_white",
        legend=dict(orientation="h", yanchor="bottom", y=1.0, x=0, font=dict(size=9)),
        xaxis_title=None, yaxis_title="Price (Rs)",
        hovermode="x unified",
    )
    return pio.to_html(
        fig, include_plotlyjs=False, full_html=False, div_id=div_id,
        config={"responsive": True, "displaylogo": False},
    )


PAGE_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Price Forecast Report</title>
<script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
<style>
  body {{ font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 24px 32px; background: #f5f6f8; color: #222; }}
  h1 {{ font-size: 22px; margin-bottom: 4px; }}
  .subtitle {{ color: #555; font-size: 13px; margin-bottom: 18px; }}
  #filter {{ width: 320px; padding: 8px 10px; font-size: 14px; border: 1px solid #ccc;
             border-radius: 6px; margin-bottom: 20px; }}
  .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 16px; }}
  .card {{ position: relative; background: #fff; border: 1px solid #e2e2e2; border-radius: 8px; padding: 8px; }}
  .expand-btn {{ position: absolute; top: 8px; right: 12px; z-index: 5; border: none;
                 background: rgba(255,255,255,0.85); border-radius: 4px; cursor: pointer;
                 font-size: 15px; line-height: 1; padding: 4px 7px; color: #444; }}
  .expand-btn:hover {{ background: #eee; }}
  .skipped {{ color: #a33; font-size: 13px; margin-top: 10px; }}
  #count {{ font-size: 13px; color: #555; margin-bottom: 10px; }}

  dialog#chart-dialog {{
    width: min(1100px, 92vw); height: min(720px, 88vh);
    border: none; border-radius: 10px; padding: 20px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.35);
  }}
  dialog#chart-dialog::backdrop {{ background: rgba(0,0,0,0.5); }}
  #dialog-chart-container {{ width: 100%; height: 100%; }}
  .dialog-close-btn {{
    position: absolute; top: 10px; right: 14px; border: none; background: none;
    font-size: 20px; cursor: pointer; color: #555; line-height: 1;
  }}
  .dialog-close-btn:hover {{ color: #000; }}
</style>
</head>
<body>
  <h1>Price Forecast Report</h1>
  <div class="subtitle">{n_items} items &middot; {days}-day forecast &middot;
    {interval_pct}% Prophet uncertainty interval &middot; generated {generated_at}</div>
  <input id="filter" type="text" placeholder="Filter by item name...">
  <div id="count"></div>
  <div class="grid" id="grid">
    {cards}
  </div>
  {skipped_html}

  <dialog id="chart-dialog">
    <button class="dialog-close-btn" onclick="document.getElementById('chart-dialog').close()" title="Close">✕</button>
    <div id="dialog-chart-container"></div>
  </dialog>

<script>
  const filterBox = document.getElementById("filter");
  const cardEls = Array.from(document.querySelectorAll(".card"));
  const countEl = document.getElementById("count");

  function applyFilter() {{
    const q = filterBox.value.trim().toLowerCase();
    let visible = 0;
    cardEls.forEach(c => {{
      const match = c.dataset.label.toLowerCase().includes(q);
      c.style.display = match ? "" : "none";
      if (match) visible++;
    }});
    countEl.textContent = `Showing ${{visible}} of ${{cardEls.length}} items`;
  }}
  filterBox.addEventListener("input", applyFilter);
  applyFilter();

  // --- "View large" dialog: move the SAME live Plotly node into the modal
  // (rather than redrawing a second copy), then move it back on close, so
  // the chart keeps its state and stays fully interactive. ---
  const dialogEl = document.getElementById("chart-dialog");
  const dialogContainer = document.getElementById("dialog-chart-container");

  function openLarge(btn) {{
    const card = btn.closest(".card");
    const plotDiv = document.getElementById(card.dataset.divId);
    plotDiv._originalParent = card;
    dialogContainer.appendChild(plotDiv);
    dialogEl.showModal();
    requestAnimationFrame(() => {{
      Plotly.relayout(plotDiv, {{height: dialogContainer.clientHeight, width: dialogContainer.clientWidth}});
      Plotly.Plots.resize(plotDiv);
    }});
  }}

  // Fires on Escape, the close button (dialog.close()), and our own calls.
  dialogEl.addEventListener("close", () => {{
    const plotDiv = dialogContainer.firstElementChild;
    if (plotDiv && plotDiv._originalParent) {{
      plotDiv._originalParent.appendChild(plotDiv);
      Plotly.relayout(plotDiv, {{height: {default_height}, width: undefined}});
      Plotly.Plots.resize(plotDiv);
    }}
  }});

  // Click outside the dialog's content box (i.e. on the backdrop) to close.
  dialogEl.addEventListener("click", (e) => {{
    const r = dialogEl.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) dialogEl.close();
  }});
</script>
</body>
</html>
"""


def main():
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("prophet_data_dir", help="Folder containing per-item Prophet CSVs")
    parser.add_argument(
        "--output", default="forecast_report.html",
        help="Path to write the HTML report to (default: ./forecast_report.html)",
    )
    parser.add_argument(
        "--days", type=int, default=30,
        help="Number of days to forecast into the future (default: 30)",
    )
    parser.add_argument(
        "--interval-width", type=float, default=0.90,
        help="Prophet uncertainty interval width, e.g. 0.90 = 90%% band (default: 0.90)",
    )
    args = parser.parse_args()

    prophet_data_dir = Path(args.prophet_data_dir)
    if not prophet_data_dir.is_dir():
        print(f"Error: {prophet_data_dir} is not a folder", file=sys.stderr)
        sys.exit(1)

    csv_files = sorted(
        p for p in prophet_data_dir.glob("*.csv") if p.name != "conversion_log.csv"
    )
    if not csv_files:
        print(f"Error: no CSV files found in {prophet_data_dir}", file=sys.stderr)
        sys.exit(1)

    cards = []
    skipped = []

    for i, csv_path in enumerate(csv_files):
        df = load_item_csv(csv_path)
        if len(df) < 2:
            print(f"  [{i + 1}/{len(csv_files)}] skipping {csv_path.stem}: fewer than 2 data points")
            skipped.append((csv_path.stem, "fewer than 2 data points"))
            continue

        label = make_item_label(csv_path, df)
        print(f"  [{i + 1}/{len(csv_files)}] forecasting {label} ({len(df)} historical points)...")

        try:
            forecast = fit_and_forecast(df, args.days, args.interval_width)
        except Exception as e:
            print(f"    FAILED: {e}")
            skipped.append((csv_path.stem, str(e)))
            continue

        div_id = f"chart_{i}"
        chart_html = build_chart_html(label, df, forecast, args.interval_width, div_id=div_id)
        cards.append(
            f'<div class="card" data-label="{label}" data-div-id="{div_id}">'
            f'<button class="expand-btn" onclick="openLarge(this)" title="View large">⤢</button>'
            f'{chart_html}</div>'
        )

    if not cards:
        print("Error: no items produced a forecast", file=sys.stderr)
        sys.exit(1)

    skipped_html = ""
    if skipped:
        items = "".join(f"<li>{name}: {reason}</li>" for name, reason in skipped)
        skipped_html = f'<div class="skipped"><b>Skipped {len(skipped)} item(s):</b><ul>{items}</ul></div>'

    from datetime import datetime
    html = PAGE_TEMPLATE.format(
        n_items=len(cards),
        days=args.days,
        interval_pct=int(args.interval_width * 100),
        generated_at=datetime.now().strftime("%Y-%m-%d %H:%M"),
        cards="\n".join(cards),
        skipped_html=skipped_html,
        default_height=CHART_HEIGHT,
    )

    output_path = Path(args.output)
    output_path.write_text(html, encoding="utf-8")

    print(f"\nDone. {len(cards)} items forecast, {len(skipped)} skipped.")
    print(f"Report written to: {output_path.resolve()}")


if __name__ == "__main__":
    main()

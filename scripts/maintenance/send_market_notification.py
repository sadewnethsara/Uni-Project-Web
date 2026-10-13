#!/usr/bin/env python3
"""
NAMIS Automated Market Notification Dispatcher:
1. Verifies that today's / recent prices have actually been updated in Supabase.
2. Checks whether a notification has already been sent for this date/batch to avoid duplicate spam.
3. Formats a professional notification (Market name, Date, Commodity count).
4. Dispatches an FCM topic push notification to all subscribed mobile apps ('market_updates').
5. Records the notification in the 'market_updates' table for in-app history.
"""

import sys
import os
import json
import urllib.request
import ssl
from datetime import datetime, timezone, timedelta

# Ensure shared environment loader is accessible
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import env_loader

try:
    import firebase_admin
    from firebase_admin import credentials, messaging
except ImportError:
    print("[WARN] firebase-admin package is not installed. Run: pip install firebase-admin")
    firebase_admin = None

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
FIREBASE_SA_JSON = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")

def get_ssl_context():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx

def run_supabase_get(endpoint: str) -> tuple:
    """Executes a GET query to Supabase PostgREST, returning (data_list, total_count)."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return [], 0
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Range-Unit": "items",
        "Prefer": "count=exact"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15, context=get_ssl_context()) as resp:
            content_range = resp.headers.get("content-range")
            count = 0
            if content_range and "/" in content_range:
                count = int(content_range.split("/")[-1])
            data = json.loads(resp.read().decode("utf-8"))
            return data, count
    except Exception as e:
        print(f"[WARN] Error querying Supabase '{endpoint}': {e}")
        return [], 0

def run_supabase_post(endpoint: str, payload: dict) -> bool:
    """Executes an INSERT to Supabase PostgREST."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return False
    url = f"{SUPABASE_URL.rstrip('/')}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15, context=get_ssl_context()) as resp:
            return resp.status in (200, 201)
    except Exception as e:
        print(f"[WARN] Error inserting into Supabase '{endpoint}': {e}")
        return False

def check_recent_updates() -> dict:
    """
    Checks if prices for today (or the latest trading date) were inserted or updated.
    Returns:
        {
            'has_updates': bool,
            'latest_date': 'YYYY-MM-DD',
            'markets': ['dambulla', ...],
            'total_commodities': int,
            'price_types': ['wholesale', ...]
        }
    """
    # 1. Find the latest price date recorded in the system
    latest_rows, _ = run_supabase_get("price_entries?select=date&order=date.desc&limit=1")
    if not latest_rows:
        return {"has_updates": False, "reason": "No price entries in database"}
    
    latest_date = latest_rows[0]["date"]
    
    # 2. Check how many records exist for this latest date
    entries, count = run_supabase_get(
        f"price_entries?select=market_id,price_type,vegetable_id&date=eq.{latest_date}"
    )
    if count == 0:
        return {"has_updates": False, "reason": f"No entries for {latest_date}"}

    markets = sorted(list(set(r.get("market_id") for r in entries if r.get("market_id"))))
    price_types = sorted(list(set(r.get("price_type") for r in entries if r.get("price_type"))))

    # 3. Check duplicate prevention: has this date already been notified in market_updates?
    notifs, notif_count = run_supabase_get(
        f"market_updates?select=id,total_commodities,markets&date=eq.{latest_date}&order=created_at.desc&limit=1"
    )
    if notif_count > 0:
        prev_notif = notifs[0]
        prev_commodities = prev_notif.get("total_commodities", 0)
        # If the existing notification already covered this date with comparable or higher count, skip!
        if count <= prev_commodities:
            return {
                "has_updates": False,
                "reason": f"Already notified for {latest_date} ({prev_commodities} commodities recorded)."
            }

    return {
        "has_updates": True,
        "latest_date": latest_date,
        "markets": markets,
        "total_commodities": count,
        "price_types": price_types
    }

def format_notification(summary: dict) -> tuple:
    """Formats professional notification Title, Short Body, and Expanded BigText."""
    market_labels = {
        "dambulla": "Dambulla DEC",
        "pettah": "Pettah Wholesale Market",
        "kandy": "Kandy Economic Centre",
        "keppetipola": "Keppetipola Economic Centre",
        "narahenpita": "Narahenpita Economic Centre",
        "peliyagoda": "Peliyagoda Market"
    }

    raw_markets = summary.get("markets", [])
    display_markets = [market_labels.get(m, m.title()) for m in raw_markets]
    
    target_date_str = summary["latest_date"]
    try:
        dt = datetime.strptime(target_date_str, "%Y-%m-%d")
        formatted_date = dt.strftime("%B %d, %Y")
    except Exception:
        formatted_date = target_date_str

    is_wholesale = "wholesale" in summary.get("price_types", ["wholesale"])
    type_str = "Wholesale" if is_wholesale else "Retail"

    if len(display_markets) == 1:
        primary_market = display_markets[0]
        title = f"📊 {type_str} Market Update: {primary_market}"
        body = f"{primary_market} prices for {formatted_date} are now live ({summary['total_commodities']} commodities updated)."
    elif len(display_markets) > 1:
        title = f"📊 Sri Lanka {type_str} Market Update"
        body = f"Prices for {', '.join(display_markets[:2])} ({formatted_date}) are now live across {summary['total_commodities']} commodities."
    else:
        title = f"📊 NAMIS {type_str} Price Bulletin"
        body = f"Daily commodity prices for {formatted_date} have been updated successfully."

    primary_market_id = raw_markets[0] if raw_markets else "dambulla"

    payload_data = {
        "click_action": "FLUTTER_NOTIFICATION_CLICK",
        "type": "market_update",
        "market_id": primary_market_id,
        "date": target_date_str,
        "price_type": "wholesale" if is_wholesale else "retail"
    }

    return title, body, payload_data

def send_fcm_topic_notification(title: str, body: str, payload_data: dict) -> str:
    """Dispatches FCM push message to the 'market_updates' topic."""
    if not FIREBASE_SA_JSON:
        print("[ERROR] FIREBASE_SERVICE_ACCOUNT_JSON secret is not set.")
        return ""
    if not firebase_admin:
        print("[ERROR] firebase-admin package is missing. Skipping send.")
        return ""

    sa_info = json.loads(FIREBASE_SA_JSON)
    cred = credentials.Certificate(sa_info)
    
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(cred)

    android_config = messaging.AndroidConfig(
        priority="high",
        notification=messaging.AndroidNotification(
            title=title,
            body=body,
            channel_id="market_updates_channel",
            sound="default",
            color="#16a34a",
            default_sound=True,
            default_vibrate_timings=True
        )
    )

    message = messaging.Message(
        topic="market_updates",
        notification=messaging.Notification(
            title=title,
            body=body
        ),
        data=payload_data,
        android=android_config
    )

    response = messaging.send(message)
    return response

def main():
    print("=" * 65)
    print("  NAMIS DATABASE SYNC VERIFICATION & PUSH NOTIFICATION")
    print("=" * 65)

    summary = check_recent_updates()
    if not summary.get("has_updates"):
        print(f"[INFO] Verification completed: {summary.get('reason', 'No new updates')}.")
        print("[INFO] Notification dispatch skipped. Clean exit.")
        return

    print(f"[+] Verified fresh data for date: {summary['latest_date']}")
    print(f"[+] Total commodities: {summary['total_commodities']} in markets: {summary['markets']}")

    title, body, payload = format_notification(summary)
    print(f"[*] Notification Title: {title}")
    print(f"[*] Notification Body:  {body}")

    fcm_id = send_fcm_topic_notification(title, body, payload)
    if fcm_id:
        print(f"[SUCCESS] Broadcasted to FCM topic 'market_updates'. Message ID: {fcm_id}")
        # Record to market_updates table for in-app history & duplicate prevention
        record = {
            "date": summary["latest_date"],
            "markets": summary["markets"],
            "total_commodities": summary["total_commodities"],
            "title": title,
            "message": body,
            "fcm_message_id": fcm_id
        }
        run_supabase_post("market_updates", record)
        print("[+] Logged update event to 'market_updates' table.")
    else:
        print("[WARN] FCM broadcast was not completed.")

if __name__ == "__main__":
    main()

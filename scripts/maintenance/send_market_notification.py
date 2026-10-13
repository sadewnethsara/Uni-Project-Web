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

TRANSLATIONS = {
    "en": {
        "wholesale": "Wholesale",
        "retail": "Retail",
        "update_title": "📊 {price_type} Market Update: {market}",
        "island_title": "📊 Sri Lanka {price_type} Market Update",
        "single_market_body": "{market} prices for {date} are now live ({count} commodities updated).",
        "multi_market_body": "Prices for {markets} ({date}) are now live across {count} commodities.",
        "general_body": "Daily commodity prices for {date} have been updated successfully.",
        "markets": {
            "dambulla": "Dambulla Economic Center",
            "pettah": "Pettah Wholesale Market",
            "kandy": "Kandy Central Market",
            "keppetipola": "Keppetipola Economic Center",
            "narahenpita": "Narahenpita Economic Center",
            "peliyagoda": "Peliyagoda Economic Center",
            "meegoda": "Meegoda Economic Center",
            "norochchole": "Norochchole Economic Center",
            "thambuththegama": "Thambuththegama Economic Center",
            "nuwara-eliya": "Nuwara Eliya Economic Center",
            "bandarawela": "Bandarawela Economic Center",
            "veyangoda": "Veyangoda Economic Center",
            "manning": "Manning Market"
        }
    },
    "si": {
        "wholesale": "තොග",
        "retail": "සිල්ලර",
        "update_title": "📊 {price_type} මිල යාවත්කාලීන විය: {market}",
        "island_title": "📊 ශ්‍රී ලංකා {price_type} වෙළෙඳපොළ මිල යාවත්කාලීන විය",
        "single_market_body": "{date} දින {market} මිල ගණන් දැන් නිකුත් කර ඇත (භාණ්ඩ {count}ක් යාවත්කාලීනයි).",
        "multi_market_body": "{date} දින {markets} මිල ගණන් භාණ්ඩ {count}ක් සඳහා දැන් නිකුත් කර ඇත.",
        "general_body": "{date} දින සඳහා දෛනික එළවළු සහ කෘෂි මිල ගණන් යාවත්කාලීන කර ඇත.",
        "markets": {
            "dambulla": "දඹුල්ල ආර්ථික මධ්‍යස්ථානය",
            "pettah": "පිටකොටුව තොග වෙළෙඳපොළ",
            "kandy": "මහනුවර වෙළෙඳපොළ",
            "keppetipola": "කැප්පෙටිපොළ ආර්ථික මධ්‍යස්ථානය",
            "narahenpita": "නාරාහේන්පිට ආර්ථික මධ්‍යස්ථානය",
            "peliyagoda": "පෑලියගොඩ ආර්ථික මධ්‍යස්ථානය",
            "meegoda": "මීගොඩ ආර්ථික මධ්‍යස්ථානය",
            "norochchole": "නොරොච්චෝලේ ආර්ථික මධ්‍යස්ථානය",
            "thambuththegama": "තඹුත්තේගම ආර්ථික මධ්‍යස්ථානය",
            "nuwara-eliya": "නුවරඑළිය ආර්ථික මධ්‍යස්ථානය",
            "bandarawela": "බණ්ඩාරවෙල ආර්ථික මධ්‍යස්ථානය",
            "veyangoda": "වේයන්ගොඩ ආර්ථික මධ්‍යස්ථානය",
            "manning": "මැනිං වෙළෙඳපොළ"
        }
    },
    "ta": {
        "wholesale": "மொத்த",
        "retail": "சில்லறை",
        "update_title": "📊 {price_type} சந்தை விலை புதுப்பிக்கப்பட்டது: {market}",
        "island_title": "📊 இலங்கை {price_type} சந்தை விலை புதுப்பிக்கப்பட்டது",
        "single_market_body": "{date} ஆம் திகதிக்கான {market} விலைகள் இப்போது கிடைக்கின்றன ({count} பொருட்கள் புதுப்பிக்கப்பட்டன).",
        "multi_market_body": "{date} ஆம் திகதிக்கான {markets} விலைகள் {count} பொருட்களுக்கு இப்போது கிடைக்கின்றன.",
        "general_body": "{date} ஆம் திகதிக்கான தினசரி காய்கறி விலைகள் புதுப்பிக்கப்பட்டுள்ளன.",
        "markets": {
            "dambulla": "தம்புள்ளை பொருளாதார மையம்",
            "pettah": "புறக்கோட்டை மொத்த சந்தை",
            "kandy": "கண்டி மத்திய சந்தை",
            "keppetipola": "கெப்பட்டிபொல பொருளாதார மையம்",
            "narahenpita": "நாராஹேன்பிட்ட பொருளாதார மையம்",
            "peliyagoda": "பேலியகொடை பொருளாதார மையம்",
            "meegoda": "மீகொட பொருளாதார மையம்",
            "norochchole": "நுரைச்சோலை பொருளாதார மையம்",
            "thambuththegama": "தம்புத்தேகம பொருளாதார மையம்",
            "nuwara-eliya": "நுவரெலியா பொருளாதார மையம்",
            "bandarawela": "பண்டாரவளை பொருளாதார மையம்",
            "veyangoda": "வேயங்கொட பொருளாதார மையம்",
            "manning": "மெனிங் சந்தை"
        }
    }
}

def format_multilingual_notifications(summary: dict) -> tuple:
    """Formats localized notification Title & Body for English (en), Sinhala (si), and Tamil (ta)."""
    raw_markets = summary.get("markets", [])
    target_date_str = summary.get("latest_date") or datetime.now().strftime("%Y-%m-%d")
    is_wholesale = "wholesale" in summary.get("price_types", ["wholesale"])
    count = summary.get("total_commodities", 0)

    try:
        dt = datetime.strptime(target_date_str, "%Y-%m-%d")
        en_date = dt.strftime("%B %d, %Y")
        si_date = f"{dt.year} {['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි', 'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'][dt.month - 1]} {dt.day}"
        ta_date = f"{dt.year} {['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'][dt.month - 1]} {dt.day}"
    except Exception:
        en_date = si_date = ta_date = target_date_str

    dates = {"en": en_date, "si": si_date, "ta": ta_date}
    results = {}

    for lang in ["en", "si", "ta"]:
        t = TRANSLATIONS[lang]
        price_type_str = t["wholesale"] if is_wholesale else t["retail"]
        market_names = [t["markets"].get(m, m.title()) for m in raw_markets]

        if len(market_names) == 1:
            primary = market_names[0]
            title = t["update_title"].format(price_type=price_type_str, market=primary)
            body = t["single_market_body"].format(market=primary, date=dates[lang], count=count)
        elif len(market_names) > 1:
            title = t["island_title"].format(price_type=price_type_str)
            joined_mkts = ", ".join(market_names[:2])
            body = t["multi_market_body"].format(markets=joined_mkts, date=dates[lang], count=count)
        else:
            title = t["island_title"].format(price_type=price_type_str)
            body = t["general_body"].format(date=dates[lang])

        results[lang] = {"title": title, "body": body}

    primary_market_id = raw_markets[0] if raw_markets else "dambulla"
    payload_data = {
        "click_action": "FLUTTER_NOTIFICATION_CLICK",
        "type": "market_update",
        "market_id": primary_market_id,
        "date": target_date_str,
        "price_type": "wholesale" if is_wholesale else "retail"
    }

    return results, payload_data

def send_fcm_topic_notification(
    title: str, 
    body: str, 
    payload_data: dict,
    topic: str = "market_updates",
    channel_id: str = "market_updates_channel"
) -> str:
    """Dispatches FCM push message to the specified topic and Android channel."""
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

    # Distinct visual styling based on notification channel
    is_surge = (channel_id == "price_surges_channel" or topic == "price_surges")
    accent_color = "#DC2626" if is_surge else "#16A34A"  # Red for surge alerts, Green for daily bulletins

    android_config = messaging.AndroidConfig(
        priority="high",
        notification=messaging.AndroidNotification(
            title=title,
            body=body,
            channel_id=channel_id,
            sound="default",
            color=accent_color,
            default_sound=True,
            default_vibrate_timings=True
        )
    )

    message = messaging.Message(
        topic=topic,
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
    import argparse
    parser = argparse.ArgumentParser(description="Send NAMIS Market Push Notification")
    parser.add_argument("--force", action="store_true", help="Force send even if already sent")
    parser.add_argument("--title", type=str, default="", help="Custom notification title override")
    parser.add_argument("--body", type=str, default="", help="Custom notification body override")
    parser.add_argument("--market", type=str, default="", help="Market ID for payload (e.g. dambulla)")
    parser.add_argument("--date", type=str, default="", help="Date YYYY-MM-DD override")
    parser.add_argument(
        "--topic", 
        type=str, 
        default="market_updates", 
        choices=["market_updates", "price_surges"],
        help="FCM Topic: market_updates or price_surges"
    )
    args = parser.parse_args()

    channel_id = "price_surges_channel" if args.topic == "price_surges" else "market_updates_channel"

    print("=" * 65)
    print("  NAMIS DATABASE SYNC VERIFICATION & PUSH NOTIFICATION")
    print(f"  Channel: {channel_id} | Topic: {args.topic}")
    print("=" * 65)
    print("=" * 65)

    target_date = args.date or datetime.now().strftime("%Y-%m-%d")

    # If custom title & body are provided, we send directly
    if args.title and args.body:
        print("[*] Custom Notification Mode Activated.")
        primary_market = args.market or "dambulla"
        payload = {
            "click_action": "FLUTTER_NOTIFICATION_CLICK",
            "type": "market_update",
            "market_id": primary_market,
            "date": target_date,
            "price_type": "wholesale"
        }
        markets_list = [primary_market]
        total_items = 0
        localized = {
            "en": {"title": args.title, "body": args.body},
            "si": {"title": args.title, "body": args.body},
            "ta": {"title": args.title, "body": args.body}
        }
    else:
        summary = check_recent_updates()
        if not summary.get("has_updates") and not args.force:
            print(f"[INFO] Verification completed: {summary.get('reason', 'No new updates')}.")
            print("[INFO] Notification dispatch skipped. Clean exit.")
            return

        target_date = summary.get("latest_date", target_date)
        markets_list = summary.get("markets", [args.market or "dambulla"])
        total_items = summary.get("total_commodities", 0)

        print(f"[+] Verified fresh data for date: {target_date}")
        print(f"[+] Total commodities: {total_items} in markets: {markets_list}")

        localized, payload = format_multilingual_notifications(summary)

    # 1. Dispatch English (Default + 'en' topic)
    en_title = localized["en"]["title"]
    en_body = localized["en"]["body"]
    print(f"[*] Dispatching English to '{args.topic}' and '{args.topic}_en'...")
    en_fcm_id = send_fcm_topic_notification(en_title, en_body, payload, topic=args.topic, channel_id=channel_id)
    send_fcm_topic_notification(en_title, en_body, payload, topic=f"{args.topic}_en", channel_id=channel_id)

    # 2. Dispatch Sinhala ('si' topic)
    si_title = localized["si"]["title"]
    si_body = localized["si"]["body"]
    print(f"[*] Dispatching Sinhala to '{args.topic}_si'...")
    send_fcm_topic_notification(si_title, si_body, payload, topic=f"{args.topic}_si", channel_id=channel_id)

    # 3. Dispatch Tamil ('ta' topic)
    ta_title = localized["ta"]["title"]
    ta_body = localized["ta"]["body"]
    print(f"[*] Dispatching Tamil to '{args.topic}_ta'...")
    send_fcm_topic_notification(ta_title, ta_body, payload, topic=f"{args.topic}_ta", channel_id=channel_id)

    if en_fcm_id:
        record = {
            "date": target_date,
            "markets": markets_list,
            "total_commodities": total_items,
            "title": en_title,
            "message": en_body,
            "title_si": si_title,
            "message_si": si_body,
            "title_ta": ta_title,
            "message_ta": ta_body,
            "fcm_message_id": en_fcm_id
        }
        run_supabase_post("market_updates", record)
        print("[+] Logged multilingual update event to 'market_updates' table.")
    else:
        print("[WARN] FCM broadcast was not completed.")

if __name__ == "__main__":
    main()

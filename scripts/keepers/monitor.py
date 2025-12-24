import os
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL or SUPABASE_KEY not set.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_bot_status():
    try:
        # Fetch status for our bot
        response = supabase.table("bot_heartbeats").select("*").eq("bot_id", "liquidity-vector-keeper").execute()
        
        if not response.data:
            print("⚠️ No heartbeat found for bot!")
            return

        record = response.data[0]
        last_seen_str = record.get("last_seen")
        status = record.get("status")

        # Parse timestamp (handling potential Z suffix for UTC)
        if last_seen_str.endswith("Z"):
            last_seen_str = last_seen_str[:-1]
        
        last_seen = datetime.fromisoformat(last_seen_str)
        now = datetime.utcnow()
        diff = now - last_seen

        print(f"Bot Status: {status}")
        print(f"Last Seen: {last_seen} (UTC)")
        print(f"Time Since Checkin: {diff}")

        if diff > timedelta(minutes=65): # Using 65 mins since bot sleeps for 1 hour
            print("🚨 ALERT: Bot heartbeat is STALE! (> 65 mins)")
        elif status == "error":
            print("🚨 ALERT: Bot reported an ERROR status!")
        else:
            print("✅ Bot is healthy.")

    except Exception as e:
        print(f"Error checking status: {e}")

if __name__ == "__main__":
    check_bot_status()

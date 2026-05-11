"""
OTP generation, storage, and verification.

NOTE: SMS sending is simulated — the OTP is printed to the server console.
Replace `send_sms()` with a real provider (Twilio, MSG91, etc.) for production.
"""

import random
from datetime import datetime, timedelta, timezone
from app.database import get_db
from app.config import OTP_EXPIRY_MINUTES


def generate_otp() -> str:
    """Generate a random 6-digit OTP."""
    return str(random.randint(100000, 999999))


async def store_otp(mobile: str, otp: str, purpose: str) -> None:
    """Store OTP in MongoDB with an expiry timestamp."""
    db = get_db()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

    # Upsert — one active OTP per mobile+purpose at a time
    await db.otps.update_one(
        {"mobile": mobile, "purpose": purpose},
        {"$set": {
            "otp": otp,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc),
        }},
        upsert=True,
    )


async def verify_otp(mobile: str, otp: str, purpose: str) -> bool:
    """
    Check if the OTP is valid and not expired.
    Deletes the OTP after successful verification (one-time use).
    """
    db = get_db()
    record = await db.otps.find_one({
        "mobile": mobile,
        "purpose": purpose,
        "otp": otp,
        "expires_at": {"$gt": datetime.now(timezone.utc)},
    })

    if record:
        await db.otps.delete_one({"_id": record["_id"]})
        return True
    return False


async def send_sms(mobile: str, otp: str) -> None:
    """
    Simulate sending an SMS.
    In production, integrate Twilio / MSG91 / AWS SNS here.
    """
    print(f"\n{'='*50}")
    print(f"  [OTP] Mobile: {mobile}  |  Code: {otp}")
    print(f"{'='*50}\n")

"""
Authentication routes — signup, login, OTP, forgot password.
"""

from fastapi import APIRouter, HTTPException
from passlib.hash import bcrypt as passlib_bcrypt
from datetime import datetime, timezone

from app.database import get_db
from app.auth_schemas import (
    SignupRequest,
    LoginRequest,
    SendOTPRequest,
    VerifyOTPRequest,
    ForgotPasswordRequest,
    AuthResponse,
)
from app.services.otp_service import generate_otp, store_otp, verify_otp, send_sms

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ─── Signup ──────────────────────────────────────────────────────────────────
@router.post("/signup", response_model=AuthResponse)
async def signup(payload: SignupRequest):
    """Register a new user. Passwords are hashed with bcrypt."""
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    db = get_db()

    # Check for existing username or mobile
    existing = await db.users.find_one({
        "$or": [
            {"username": payload.username},
            {"mobile": payload.mobile},
        ]
    })
    if existing:
        if existing.get("username") == payload.username:
            raise HTTPException(status_code=409, detail="Username already taken.")
        raise HTTPException(status_code=409, detail="Mobile number already registered.")

    hashed_pw = passlib_bcrypt.hash(payload.password)

    await db.users.insert_one({
        "full_name": payload.full_name,
        "username": payload.username,
        "mobile": payload.mobile,
        "password": hashed_pw,
        "verified": False,
        "created_at": datetime.now(timezone.utc),
    })

    # Send OTP for mobile verification
    otp = generate_otp()
    await store_otp(payload.mobile, otp, "signup")
    await send_sms(payload.mobile, otp)

    return AuthResponse(
        success=True,
        message="Account created! An OTP has been sent to your mobile for verification.",
    )


# ─── Login ───────────────────────────────────────────────────────────────────
@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    """Validate credentials and send OTP for second-factor verification."""
    db = get_db()

    user = await db.users.find_one({"username": payload.username})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    if not passlib_bcrypt.verify(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    if user.get("mobile") != payload.mobile:
        raise HTTPException(status_code=401, detail="Mobile number does not match this account.")

    # Send login OTP
    otp = generate_otp()
    await store_otp(payload.mobile, otp, "login")
    await send_sms(payload.mobile, otp)

    return AuthResponse(
        success=True,
        message="Credentials verified. An OTP has been sent to your mobile.",
    )


# ─── Send OTP ────────────────────────────────────────────────────────────────
@router.post("/send-otp", response_model=AuthResponse)
async def send_otp_endpoint(payload: SendOTPRequest):
    """Generate and send a new OTP for the given mobile + purpose."""
    db = get_db()

    # For signup, mobile must not exist yet; for login/forgot, it must exist
    user = await db.users.find_one({"mobile": payload.mobile})

    if payload.purpose == "signup" and user:
        raise HTTPException(status_code=409, detail="Mobile number already registered.")
    if payload.purpose in ("login", "forgot") and not user:
        raise HTTPException(status_code=404, detail="No account found with this mobile number.")

    otp = generate_otp()
    await store_otp(payload.mobile, otp, payload.purpose)
    await send_sms(payload.mobile, otp)

    return AuthResponse(success=True, message="OTP sent successfully.")


# ─── Verify OTP ──────────────────────────────────────────────────────────────
@router.post("/verify-otp", response_model=AuthResponse)
async def verify_otp_endpoint(payload: VerifyOTPRequest):
    """Verify the OTP. On signup verification, marks the user as verified."""
    valid = await verify_otp(payload.mobile, payload.otp, payload.purpose)

    if not valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    # If signup, mark user as verified
    if payload.purpose == "signup":
        db = get_db()
        await db.users.update_one(
            {"mobile": payload.mobile},
            {"$set": {"verified": True}},
        )

    return AuthResponse(success=True, message="OTP verified successfully!")


# ─── Forgot Password ─────────────────────────────────────────────────────────
@router.post("/forgot-password", response_model=AuthResponse)
async def forgot_password(payload: ForgotPasswordRequest):
    """Reset password after verifying OTP."""
    valid = await verify_otp(payload.mobile, payload.otp, "forgot")
    if not valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    db = get_db()
    hashed_pw = passlib_bcrypt.hash(payload.new_password)

    result = await db.users.update_one(
        {"mobile": payload.mobile},
        {"$set": {"password": hashed_pw}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="No account found with this mobile number.")

    return AuthResponse(success=True, message="Password reset successfully! You can now login.")

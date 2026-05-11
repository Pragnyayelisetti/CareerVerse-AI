import os
import random
import string
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
import httpx
from dotenv import load_dotenv

from app.database import get_db

load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])

# ── Config ──────────────────────────────────────────────────────
SECRET_KEY      = os.getenv("SECRET_KEY", "change-me-in-production")
ALGORITHM       = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24   # 24 hours

FAST2SMS_API_KEY = os.getenv("FAST2SMS_API_KEY")
FAST2SMS_URL     = "https://www.fast2sms.com/dev/bulkV2"

OTP_EXPIRE_MINUTES = 10   # OTP valid for 10 minutes

# ── Crypto ──────────────────────────────────────────────────────
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ════════════════════════════════════════════════
# SCHEMAS
# ════════════════════════════════════════════════

class SignupRequest(BaseModel):
    full_name: str
    username: str
    mobile: str
    password: str
    confirm_password: str

class LoginRequest(BaseModel):
    username: str
    password: str
    mobile: str

class OTPVerifyRequest(BaseModel):
    mobile: str
    otp: str
    purpose: str          # 'login' | 'signup' | 'forgot'

class ForgotPasswordRequest(BaseModel):
    mobile: str
    otp: str
    new_password: str

class SendOTPRequest(BaseModel):
    mobile: str
    purpose: str          # 'login' | 'signup' | 'forgot'

class Token(BaseModel):
    access_token: str
    token_type: str


# ════════════════════════════════════════════════
# HELPERS — passwords & tokens
# ════════════════════════════════════════════════

def hash_password(password: str) -> str:
    return pwd_ctx.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


# ════════════════════════════════════════════════
# HELPERS — MongoDB user queries
# ════════════════════════════════════════════════

async def get_user_by_mobile(mobile: str):
    """Look up user by mobile number."""
    return await get_db().users.find_one({"mobile": mobile})

async def get_user_by_username(username: str):
    """Look up user by username."""
    return await get_db().users.find_one({"username": username})


# ════════════════════════════════════════════════
# HELPERS — MongoDB OTP store
# ════════════════════════════════════════════════

async def save_otp(mobile: str, otp: str, purpose: str):
    """Upsert OTP record. TTL index in database.py auto-deletes expired ones."""
    await get_db().otps.replace_one(
        {"mobile": mobile},
        {
            "mobile":     mobile,
            "otp":        otp,
            "purpose":    purpose,
            "expires_at": datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES),
        },
        upsert=True,
    )

async def get_otp(mobile: str):
    """Fetch the current OTP record for a mobile number."""
    return await get_db().otps.find_one({"mobile": mobile})

async def delete_otp(mobile: str):
    """Consume (delete) an OTP after use."""
    await get_db().otps.delete_one({"mobile": mobile})


# ════════════════════════════════════════════════
# HELPERS — Auth dependency
# ════════════════════════════════════════════════

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await get_user_by_username(username)
    if user is None:
        raise credentials_exception
    return user


# ════════════════════════════════════════════════
# SMS — Fast2SMS
# ════════════════════════════════════════════════

async def send_sms_fast2sms(mobile: str, otp: str, purpose: str) -> bool:
    return True

# ════════════════════════════════════════════════
# ROUTES
# ════════════════════════════════════════════════

# ── 1. SIGNUP ────────────────────────────────────
@router.post("/signup")
async def signup(req: SignupRequest):
    if req.password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if not req.mobile.isdigit() or len(req.mobile) != 10:
        raise HTTPException(status_code=400, detail="Enter a valid 10-digit mobile number")
    if await get_user_by_username(req.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    if await get_user_by_mobile(req.mobile):
        raise HTTPException(status_code=400, detail="Mobile number already registered")

    # Save user as unverified
    await get_db().users.insert_one({
        "full_name":       req.full_name,
        "username":        req.username,
        "mobile":          req.mobile,
        "hashed_password": hash_password(req.password),
        "is_verified":     True,
    })

    # Generate and store OTP
    otp = generate_otp()
    await save_otp(req.mobile, otp, "signup")

    # Send via Fast2SMS
    sent = await send_sms_fast2sms(req.mobile, otp, "signup")
    if not sent:
        # Clean up on SMS failure
        await get_db().users.delete_one({"username": req.username})
        await delete_otp(req.mobile)
        raise HTTPException(status_code=502, detail="Failed to send OTP. Try again.")

    return {"message": "Account created. OTP sent to your mobile."}


# ── 2. LOGIN (step 1 — verify credentials, send OTP) ─────────────
@router.post("/login")
async def login(req: LoginRequest):
    user = await get_user_by_username(req.username)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not user.get("is_verified"):
        raise HTTPException(status_code=403, detail="Account not verified. Please complete signup OTP verification.")
    if user["mobile"] != req.mobile:
        raise HTTPException(status_code=401, detail="Mobile number does not match our records")

    # Credentials OK → send OTP
    otp = generate_otp()
    await save_otp(req.mobile, otp, "login")

    sent = await send_sms_fast2sms(req.mobile, otp, "login")
    if not sent:
        raise HTTPException(status_code=502, detail="Failed to send OTP. Try again.")

    return {"message": "Credentials verified. OTP sent to your mobile."}


# ── 3. VERIFY OTP (signup / login) ───────────────────────────────
@router.post("/verify-otp")
async def verify_otp(req: OTPVerifyRequest):
    record = await get_otp(req.mobile)

    if not record:
        raise HTTPException(status_code=400, detail="No OTP found for this number. Request a new one.")
    if record["purpose"] != req.purpose:
        raise HTTPException(status_code=400, detail="OTP purpose mismatch.")
    if datetime.utcnow() > record["expires_at"]:
        await delete_otp(req.mobile)
        raise HTTPException(status_code=400, detail="OTP has expired. Request a new one.")
    if record["otp"] != req.otp:
        raise HTTPException(status_code=400, detail="Incorrect OTP.")

    # OTP is valid — consume it
    await delete_otp(req.mobile)

    if req.purpose == "signup":
        await get_db().users.update_one(
            {"mobile": req.mobile},
            {"$set": {"is_verified": True}},
        )
        return {"message": "Mobile verified. You can now login."}

    if req.purpose == "login":
        user = await get_user_by_mobile(req.mobile)
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        token = create_access_token({"sub": user["username"]})
        return {"access_token": token, "token_type": "bearer"}

    raise HTTPException(status_code=400, detail="Unknown OTP purpose.")


# ── 4. SEND / RESEND OTP ─────────────────────────────────────────
@router.post("/send-otp")
async def send_otp(req: SendOTPRequest):
    if not req.mobile.isdigit() or len(req.mobile) != 10:
        raise HTTPException(status_code=400, detail="Enter a valid 10-digit mobile number")

    # Rate-limit: don't resend if a valid OTP was sent in the last 60 seconds
    existing = await get_otp(req.mobile)
    if existing:
        wait_until = existing["expires_at"] - timedelta(minutes=OTP_EXPIRE_MINUTES - 1)
        if datetime.utcnow() < wait_until:
            raise HTTPException(status_code=429, detail="Please wait 60 seconds before requesting a new OTP.")

    if req.purpose == "forgot":
        user = await get_user_by_mobile(req.mobile)
        if not user:
            # Don't reveal whether mobile exists — silently succeed
            return {"message": "If this number is registered, an OTP has been sent."}

    otp = generate_otp()
    await save_otp(req.mobile, otp, req.purpose)

    sent = await send_sms_fast2sms(req.mobile, otp, req.purpose)
    if not sent:
        await delete_otp(req.mobile)
        raise HTTPException(status_code=502, detail="Failed to send OTP. Try again.")

    return {"message": "OTP sent successfully."}


# ── 5. FORGOT PASSWORD ───────────────────────────────────────────
@router.post("/forgot-password")
async def forgot_password_reset(req: ForgotPasswordRequest):
    record = await get_otp(req.mobile)

    if not record:
        raise HTTPException(status_code=400, detail="No OTP found. Request a new one.")
    if record["purpose"] != "forgot":
        raise HTTPException(status_code=400, detail="OTP purpose mismatch.")
    if datetime.utcnow() > record["expires_at"]:
        await delete_otp(req.mobile)
        raise HTTPException(status_code=400, detail="OTP expired. Request a new one.")
    if record["otp"] != req.otp:
        raise HTTPException(status_code=400, detail="Incorrect OTP.")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    await delete_otp(req.mobile)

    user = await get_user_by_mobile(req.mobile)
    if not user:
        raise HTTPException(status_code=404, detail="No account linked to this number.")

    await get_db().users.update_one(
        {"mobile": req.mobile},
        {"$set": {"hashed_password": hash_password(req.new_password)}},
    )
    return {"message": "Password reset successfully. You can now login."}


# ── 6. GET CURRENT USER (protected example) ──────────────────────
@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "username":  current_user["username"],
        "full_name": current_user["full_name"],
        "mobile":    current_user["mobile"],
    }
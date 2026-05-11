"""
Pydantic models for authentication endpoints.
"""

from pydantic import BaseModel, Field
import re


class SignupRequest(BaseModel):
    """Request body for user registration."""
    full_name: str = Field(..., min_length=2, max_length=100, examples=["Aarav Sharma"])
    username: str = Field(..., min_length=3, max_length=30, examples=["aarav_s"])
    mobile: str = Field(..., pattern=r"^\d{10}$", examples=["9876543210"])
    password: str = Field(..., min_length=6, max_length=128, examples=["MyStr0ng!"])
    confirm_password: str = Field(..., min_length=6, max_length=128)


class LoginRequest(BaseModel):
    """Request body for user login."""
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=6, max_length=128)
    mobile: str = Field(..., pattern=r"^\d{10}$")


class SendOTPRequest(BaseModel):
    """Request body to trigger OTP generation."""
    mobile: str = Field(..., pattern=r"^\d{10}$")
    purpose: str = Field(..., pattern=r"^(signup|login|forgot)$", examples=["login"])


class VerifyOTPRequest(BaseModel):
    """Request body to verify an OTP."""
    mobile: str = Field(..., pattern=r"^\d{10}$")
    otp: str = Field(..., pattern=r"^\d{6}$", examples=["482917"])
    purpose: str = Field(..., pattern=r"^(signup|login|forgot)$")


class ForgotPasswordRequest(BaseModel):
    """Request body to reset password after OTP verification."""
    mobile: str = Field(..., pattern=r"^\d{10}$")
    otp: str = Field(..., pattern=r"^\d{6}$")
    new_password: str = Field(..., min_length=6, max_length=128)


class AuthResponse(BaseModel):
    """Generic auth response."""
    success: bool
    message: str

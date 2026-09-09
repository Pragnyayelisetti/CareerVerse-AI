"""
Application configuration — loads environment variables via python-dotenv.
"""

import os
from dotenv import load_dotenv

# Load variables from the .env file located in the backend/ directory
load_dotenv()

ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "claude-sonnet-4-20250514")

# MongoDB — accept either env var name to avoid silent mismatches
MONGODB_URL: str = os.getenv("MONGODB_URL") or os.getenv("MONGO_URL")
DB_NAME: str = os.getenv("DB_NAME", "careerverse")

# OTP
OTP_EXPIRY_MINUTES: int = int(os.getenv("OTP_EXPIRY_MINUTES", "5"))
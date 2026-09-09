from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import connect_db, close_db
from auth import router as auth_router


# ============================================================
# DATABASE LIFESPAN
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    try:
        await connect_db()
        print("Database connected successfully")
    except Exception as e:
        print(f"Database connection failed: {e}")

    yield

    try:
        await close_db()
        print("Database connection closed")
    except Exception as e:
        print(f"Database close failed: {e}")


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="CareerVerse AI API",
    version="1.0.0",
    lifespan=lifespan,
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        # Local development
        "http://localhost:5173",
        "http://localhost:3000",

        # Production Vercel frontend
        "https://career-verse-ai-seven.vercel.app",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# AUTH ROUTES
# ============================================================

app.include_router(auth_router)


# ============================================================
# ROOT / HEALTH CHECK
# ============================================================

@app.get("/")
async def root():
    return {
        "status": "CareerVerse AI backend running"
    }
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_db, close_db
from auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await connect_db()
        print("Database connected")
    except Exception as e:
        print(f"Database connection failed: {e}")

    yield

    try:
        await close_db()
    except Exception as e:
        print(f"Database close failed: {e}")

app = FastAPI(title="CareerVerse AI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://career-verse-ai-three.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

@app.get("/")
def root():
    return {"status": "CareerVerse AI backend running"}
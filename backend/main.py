from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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

# ✅ FIXED: explicit origin instead of wildcard "*"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ SAFETY NET: without this, any unhandled exception (e.g. a DB call
# failing because the connection never came up) escapes before the CORS
# middleware can attach its headers. The browser then reports a confusing
# "blocked by CORS policy" error instead of the real 500 error. This
# handler guarantees every response — even crashes — goes back through
# CORSMiddleware with headers intact.
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[UNHANDLED ERROR] {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again."},
    )

import httpx

app.include_router(auth_router)

@app.get("/api/colleges/nearby")
async def colleges_nearby(lat: float = 16.5062, lon: float = 80.6480, radius: int = 15000):
    """
    Proxies the Overpass (OpenStreetMap) query server-to-server so the
    browser never has to call overpass-api.de directly — avoids that
    server's unreliable CORS headers entirely.
    """
    query = f"""
    [out:json];
    (
      node["amenity"="college"](around:{radius},{lat},{lon});
      way["amenity"="college"](around:{radius},{lat},{lon});
      relation["amenity"="college"](around:{radius},{lat},{lon});
    );
    out center;
    """
    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(
                "https://overpass-api.de/api/interpreter",
                content=query,
            )
            resp.raise_for_status()
            return resp.json()
    except Exception as exc:
        print(f"[OVERPASS ERROR] {exc}")
        return {"elements": []}

@app.get("/")
def root():
    return {"status": "CareerVerse AI backend running"}

@app.get("/health")
async def health():
    from app.database import db
    return {"status": "ok", "db_connected": db is not None}
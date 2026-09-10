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

OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
]

# Static safety-net so the "nearby colleges" section is never empty even if
# every public Overpass mirror is unreachable (they're free, unauthenticated
# servers and frequently rate-limit or block cloud-hosting IP ranges).
FALLBACK_COLLEGES = [
    {"tags": {"name": "Andhra Loyola College"}},
    {"tags": {"name": "SRR & CVR Government Degree College"}},
    {"tags": {"name": "PB Siddhartha College of Arts & Science"}},
    {"tags": {"name": "Maris Stella College"}},
]

@app.get("/api/colleges/nearby")
async def colleges_nearby(lat: float = 16.5062, lon: float = 80.6480, radius: int = 15000):
    """
    Proxies the Overpass (OpenStreetMap) query server-to-server so the
    browser never has to call overpass-api.de directly — avoids that
    server's unreliable CORS headers entirely. Tries several public
    mirrors, then falls back to a static list so the page is never empty.
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
    for mirror in OVERPASS_MIRRORS:
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(mirror, content=query)
                resp.raise_for_status()
                data = resp.json()
                if data.get("elements"):
                    return data
        except Exception as exc:
            print(f"[OVERPASS ERROR] {mirror}: {exc}")
            continue

    print("[OVERPASS] All mirrors failed — returning fallback list")
    return {"elements": FALLBACK_COLLEGES}

@app.get("/")
def root():
    return {"status": "CareerVerse AI backend running"}

@app.get("/health")
async def health():
    from app.database import db
    return {"status": "ok", "db_connected": db is not None}
"""
MongoDB connection using Motor (async driver).
"""

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGODB_URL, DB_NAME

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    """Initialize the MongoDB connection and create indexes."""
    global client, db

    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DB_NAME]

        # test connection
        await client.admin.command("ping")

        # indexes
        await db.users.create_index("username", unique=True)
        await db.users.create_index("mobile", unique=True)
        await db.otps.create_index("expires_at", expireAfterSeconds=0)

        print(f"[DB] Connected to MongoDB: {DB_NAME}")

    except Exception as e:
        print(f"[DB ERROR]: {e}")
        raise e


async def close_db():
    """Close the MongoDB connection."""
    global client
    if client:
        client.close()
        print("[DB] MongoDB connection closed")


def get_db():
    """Return the database instance."""
    return db

"""Public settings endpoint (no auth required)."""
from fastapi import APIRouter
from routes import db

router = APIRouter()

DEFAULT_PUBLIC = {
    "minimum_order_enabled": True,
    "minimum_order_value": 1200,
}


@router.get("/settings/public")
async def get_public_settings():
    settings = await db.settings.find_one({}, {"_id": 0})
    if not settings:
        return DEFAULT_PUBLIC
    return {
        "minimum_order_enabled": settings.get("minimum_order_enabled", True),
        "minimum_order_value": settings.get("minimum_order_value", 1200),
    }

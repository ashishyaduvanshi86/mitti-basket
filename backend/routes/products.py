"""Public products API."""
from fastapi import APIRouter
from routes import db

router = APIRouter()


@router.get("/products")
async def get_public_products():
    products = await db.products.find(
        {"availability_status": {"$ne": "HIDDEN"}},
        {"_id": 0}
    ).to_list(100)
    grouped = {
        "season_harvest": [],
        "village_pantry": [],
        "festive": [],
        "secret_garden": [],
    }
    for p in products:
        cat = p.get("category", "village_pantry")
        if cat in grouped:
            grouped[cat].append(p)
    return grouped

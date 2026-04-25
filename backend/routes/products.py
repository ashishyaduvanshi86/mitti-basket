from fastapi import APIRouter
from routes import db
from bson import ObjectId

router = APIRouter()


@router.get("/products")
async def get_public_products():
    grouped = {
        "season_harvest": [],
        "village_pantry": [],
        "festive": [],
        "secret_garden": [],
    }

    cursor = db.products.find(
        {"availability_status": {"$ne": "HIDDEN"}}
    ).sort("_id", 1)  # ensures insertion order

    async for p in cursor:
        p.pop("_id", None)
        cat = p.get("category", "village_pantry")

        if cat in grouped:
            grouped[cat].append(p)

    return grouped
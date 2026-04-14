"""Mitti Basket API — App entry point."""
from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from pathlib import Path
import os
import uuid
import logging
from datetime import datetime, timezone

from routes import db, client, ADMIN_EMAIL, ADMIN_PASSWORD
from routes.orders import router as orders_router
from routes.payments import router as payments_router
from routes.auth import router as auth_router
from routes.contact import router as contact_router
from routes.products import router as products_router
from routes.waitlist import router as waitlist_router
from routes.settings import router as settings_router
from admin_routes import admin_router

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Register route modules
api_router.include_router(orders_router)
api_router.include_router(payments_router)
api_router.include_router(auth_router)
api_router.include_router(contact_router)
api_router.include_router(products_router)
api_router.include_router(waitlist_router)
api_router.include_router(settings_router)


@api_router.get("/")
async def root():
    return {"message": "Mitti Basket API"}


app.include_router(api_router)
app.include_router(admin_router)

# Serve uploaded images
UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("mitti_basket")


@app.on_event("startup")
async def startup_seed():
    app.state.db = db

    # Seed admin user
    from admin_routes import hash_password, verify_password
    if ADMIN_EMAIL and ADMIN_PASSWORD:
        existing = await db.admin_users.find_one({"email": ADMIN_EMAIL.lower()}, {"_id": 0})
        if not existing:
            await db.admin_users.insert_one({
                "id": str(uuid.uuid4()),
                "email": ADMIN_EMAIL.lower(),
                "password_hash": hash_password(ADMIN_PASSWORD),
                "name": "Admin",
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info(f"Admin user seeded: {ADMIN_EMAIL}")
        elif not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
            await db.admin_users.update_one(
                {"email": ADMIN_EMAIL.lower()},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
            )
            logger.info("Admin password updated")

    # Seed products if empty
    count = await db.products.count_documents({})
    if count == 0:
        from seed_products import get_seed_products
        products = get_seed_products()
        if products:
            await db.products.insert_many(products)
            logger.info(f"Seeded {len(products)} products")

    # Create indexes
    await db.admin_users.create_index("email", unique=True)
    await db.products.create_index("category")
    await db.orders.create_index("created_at")
    await db.login_attempts.create_index("identifier")
    await db.product_waitlist.create_index([("product_id", 1), ("email", 1)])

    # Migrate products to new schema
    await db.products.update_many(
        {"availability_status": {"$exists": False}, "comingSoon": True},
        {"$set": {"availability_status": "COMING_SOON", "stock_quantity": 0, "low_stock_threshold": 5, "badge_type": "", "badge_text": "", "badge_color": ""}}
    )
    await db.products.update_many(
        {"availability_status": {"$exists": False}, "inStock": False},
        {"$set": {"availability_status": "SOLD_OUT", "stock_quantity": 0, "low_stock_threshold": 5, "badge_type": "", "badge_text": "", "badge_color": ""}}
    )
    await db.products.update_many(
        {"availability_status": {"$exists": False}},
        {"$set": {"availability_status": "AVAILABLE", "stock_quantity": 100, "low_stock_threshold": 5, "badge_type": "", "badge_text": "", "badge_color": ""}}
    )
    # Migrate: add harvest window fields if missing
    await db.products.update_many(
        {"next_harvest_window": {"$exists": False}},
        {"$set": {"next_harvest_window": "", "show_harvest_window": False}}
    )

    # Seed default settings
    if await db.settings.count_documents({}) == 0:
        await db.settings.insert_one({
            "minimum_order_enabled": True,
            "minimum_order_value": 1200,
            "default_shipping_message": "Your order will be delivered in 3-5 business days.",
            "default_ofd_message": "Your farm basket is arriving today!",
            "broadcast_sender_name": "Mitti Basket",
        })
        logger.info("Default settings seeded")
    else:
        # Migrate: add default_ofd_message if missing
        await db.settings.update_one(
            {"default_ofd_message": {"$exists": False}},
            {"$set": {"default_ofd_message": "Your farm basket is arriving today!"}},
        )


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

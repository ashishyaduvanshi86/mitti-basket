"""Product waitlist: notify-me when product becomes available."""
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from routes import db
from datetime import datetime, timezone

router = APIRouter()


class WaitlistSignup(BaseModel):
    product_id: str
    email: str


@router.post("/products/waitlist")
async def add_to_waitlist(data: WaitlistSignup, background_tasks: BackgroundTasks):
    product = await db.products.find_one(
        {"id": data.product_id},
        {"_id": 0, "name": 1, "availability_status": 1}
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    email_lower = data.email.strip().lower()
    existing = await db.product_waitlist.find_one(
        {"product_id": data.product_id, "email": email_lower, "notified_at": None},
        {"_id": 0}
    )
    if existing:
        return {"status": "already_subscribed", "message": "You're already on the waitlist for this product"}

    await db.product_waitlist.insert_one({
        "product_id": data.product_id,
        "email": email_lower,
        "product_name": product.get("name", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "notified_at": None,
    })

    from routes.emails import send_waitlist_confirmation_email, send_admin_waitlist_notification
    background_tasks.add_task(send_waitlist_confirmation_email, email_lower, product.get("name", ""))
    background_tasks.add_task(send_admin_waitlist_notification, email_lower, product.get("name", ""))

    return {"status": "success", "message": "You'll be notified when this product is available"}

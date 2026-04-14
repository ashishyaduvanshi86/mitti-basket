"""Order routes: create order, Google Sheets sync, retry payment."""
from fastapi import APIRouter, BackgroundTasks, HTTPException
import json
import logging
import uuid
import requests as http_requests
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from routes import db, razorpay_client, GOOGLE_SHEET_URL


logger = logging.getLogger("mitti_basket")
router = APIRouter()


# ─── Models ───

class OrderItem(BaseModel):
    product_id: str = ""
    name: str
    quantity: str
    qtyUnit: str = "kg"
    unit_price: int
    total_price: int

class OrderCreate(BaseModel):
    name: str
    phone: str
    email: str
    address: str
    city: str
    pincode: str
    items: List[OrderItem]
    subtotal: int

class OrderResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    phone: str
    email: str
    address: str
    city: str
    pincode: str
    items: List[OrderItem]
    subtotal: int
    order_status: str = "Placed"
    payment_status: str = "Pending"
    razorpay_order_id: Optional[str] = None
    created_at: str

class RetryPayment(BaseModel):
    order_id: str


# ─── Helpers ───

def send_to_google_sheets(data):
    """Send order data to Google Sheets via Apps Script.
    IMPORTANT: Must use text/plain content type due to Apps Script 302 redirect stripping POST data.
    DO NOT change to application/json or it will break with 405.
    """
    if not GOOGLE_SHEET_URL:
        return
    try:
        resp = http_requests.post(
            GOOGLE_SHEET_URL,
            data=json.dumps(data),
            headers={"Content-Type": "text/plain"},
            timeout=15,
            allow_redirects=True,
        )
        if resp.status_code == 200:
            logger.info("Data sent to Google Sheets")
        else:
            logger.error(f"Google Sheets returned {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        logger.error(f"Google Sheets error: {e}")


# ─── Routes ───

@router.post("/orders", response_model=OrderResponse)
async def create_order(input_data: OrderCreate):

    if input_data.city != "Bengaluru":
        raise HTTPException(
            status_code=400,
            detail="Currently we deliver only in Bengaluru."
        )
    order_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    items_text = ", ".join(f"{item.quantity} {item.name}" for item in input_data.items)

    # Create Razorpay order
    razorpay_order_id = None
    try:
        rz_order = razorpay_client.order.create({
            "amount": input_data.subtotal * 100,  # paise
            "currency": "INR",
            "receipt": order_id[:40],
            "notes": {"customer_name": input_data.name, "phone": input_data.phone},
        })
        razorpay_order_id = rz_order["id"]
        logger.info(f"Razorpay order created: {razorpay_order_id}")
    except Exception as e:
        logger.error(f"Razorpay order creation failed: {e}")

    doc = {
        "id": order_id,
        "name": input_data.name,
        "phone": input_data.phone,
        "email": input_data.email,
        "address": input_data.address,
        "city": input_data.city,
        "pincode": input_data.pincode,
        "items": [item.model_dump() for item in input_data.items],
        "subtotal": input_data.subtotal,
        "order_status": "Placed",
        "payment_status": "Pending",
        "razorpay_order_id": razorpay_order_id,
        "created_at": now,
    }
    await db.orders.insert_one(doc)
    
    
    # Send to Google Sheets
    send_to_google_sheets({
        "timestamp": now,
        "name": input_data.name,
        "phone": input_data.phone,
        "email": input_data.email,
        "address": input_data.address,
        "city": input_data.city,
        "pincode": input_data.pincode,
        "items_ordered": items_text,
        "order_status": "Placed",
        "payment_status": "Pending",
    })

    return OrderResponse(**{k: v for k, v in doc.items() if k != "_id"})


@router.post("/orders/retry-payment")
async def retry_payment(data: RetryPayment, background_tasks: BackgroundTasks):
    order = await db.orders.find_one({"id": data.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    try:
        rz_order = razorpay_client.order.create({
            "amount": order["subtotal"] * 100,
            "currency": "INR",
            "receipt": data.order_id[:40],
            "notes": {"customer_name": order.get("name", ""), "retry": "true"},
        })
        new_rzp_order_id = rz_order["id"]
    except Exception as e:
        logger.error(f"Retry payment Razorpay error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create payment retry")
    await db.orders.update_one(
        {"id": data.order_id},
        {"$set": {
            "razorpay_order_id": new_rzp_order_id,
            "payment_status": "Pending",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }}
    )
    from routes.emails import send_payment_retry_email
    background_tasks.add_task(send_payment_retry_email, order)
    return {
        "razorpay_order_id": new_rzp_order_id,
        "order_id": data.order_id,
        "amount": order["subtotal"],
        "name": order.get("name", ""),
        "email": order.get("email", ""),
        "phone": order.get("phone", ""),
    }

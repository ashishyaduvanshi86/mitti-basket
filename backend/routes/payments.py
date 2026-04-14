"""Payment routes: Razorpay key, verification, and webhooks."""
from fastapi import APIRouter, Request
import json
import hmac
import hashlib
import logging
from datetime import datetime, timezone
from pydantic import BaseModel
from routes import db, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
from routes.emails import send_order_confirmation_email

logger = logging.getLogger("mitti_basket")
router = APIRouter()


async def decrement_stock_for_order(order_doc):
    """Decrement stock for each item in a paid order.
    stock_quantity = number of qtyStep units available.
    E.g. Mango (qtyStep=1kg), stock=100 means 100kg.
    A 6kg order decrements by 6.
    Makhana (qtyStep=250gm), stock=100 means 100×250gm = 25kg.
    A 500gm order = 500/250 = 2 decremented.
    Auto SOLD_OUT when stock hits 0."""
    for item in order_doc.get("items", []):
        product_id = item.get("product_id") or item.get("id")
        if not product_id:
            continue
        qty_str = str(item.get("quantity", "0"))
        try:
            ordered_qty = int(float(qty_str.split()[0]))
        except (ValueError, IndexError):
            ordered_qty = 1
        if ordered_qty <= 0:
            continue
        product = await db.products.find_one({"id": product_id}, {"_id": 0, "qtyStep": 1})
        qty_step = (product or {}).get("qtyStep", 1) or 1
        units = max(1, ordered_qty // qty_step)
        result = await db.products.find_one_and_update(
            {"id": product_id, "stock_quantity": {"$gte": units}},
            {"$inc": {"stock_quantity": -units}},
            return_document=True,
            projection={"_id": 0, "id": 1, "stock_quantity": 1, "name": 1},
        )
        if result and result.get("stock_quantity", 1) <= 0:
            await db.products.update_one(
                {"id": product_id},
                {"$set": {"availability_status": "SOLD_OUT", "inStock": False}},
            )
            logger.info(f"Product {result.get('name')} auto-set to SOLD_OUT (stock=0)")


class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: str


@router.get("/razorpay-key")
async def get_razorpay_key():
    return {"key_id": RAZORPAY_KEY_ID}


@router.post("/payment/verify")
async def verify_payment(input_data: PaymentVerify):
    # Verify Razorpay signature
    msg = f"{input_data.razorpay_order_id}|{input_data.razorpay_payment_id}"
    generated_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(), msg.encode(), hashlib.sha256
    ).hexdigest()

    if generated_signature != input_data.razorpay_signature:
        return {"status": "failed", "message": "Invalid payment signature"}

    # Update order status
    order_before = await db.orders.find_one({"id": input_data.order_id}, {"_id": 0})
    already_paid = order_before and order_before.get("payment_status") == "Paid"

    await db.orders.update_one(
        {"id": input_data.order_id},
        {"$set": {
            "payment_status": "Paid",
            "order_status": "Confirmed",
            "razorpay_payment_id": input_data.razorpay_payment_id,
        }},
    )

    # Send confirmation email only if not already paid (avoid duplicate from webhook)
    if not already_paid:
        order_doc = await db.orders.find_one({"id": input_data.order_id}, {"_id": 0})
        if order_doc:
            try:
                await decrement_stock_for_order(order_doc)
            except Exception as e:
                logger.error(f"Stock decrement failed: {e}")
            try:
                send_order_confirmation_email(order_doc)
            except Exception as e:
                logger.error(f"Confirmation email failed: {e}")

    return {"status": "success", "message": "Payment verified", "order_id": input_data.order_id}


@router.post("/payment/webhook")
async def razorpay_webhook(request: Request):
    """Handle Razorpay webhook events for payment reliability."""
    body = await request.body()
    signature = request.headers.get("x-razorpay-signature", "")

    # Verify webhook signature
    if RAZORPAY_WEBHOOK_SECRET:
        expected = hmac.new(
            RAZORPAY_WEBHOOK_SECRET.encode(), body, hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(expected, signature):
            logger.warning("Webhook signature verification failed")
            return {"status": "invalid_signature"}

    payload = json.loads(body)
    event = payload.get("event", "")
    logger.info(f"Razorpay webhook received: {event}")

    if event == "payment.captured":
        payment = payload["payload"]["payment"]["entity"]
        rzp_order_id = payment.get("order_id")
        rzp_payment_id = payment.get("id")

        order = await db.orders.find_one({"razorpay_order_id": rzp_order_id}, {"_id": 0})
        if order and order.get("payment_status") != "Paid":
            await db.orders.update_one(
                {"razorpay_order_id": rzp_order_id},
                {"$set": {
                    "payment_status": "Paid",
                    "order_status": "Confirmed",
                    "razorpay_payment_id": rzp_payment_id,
                    "webhook_verified_at": datetime.now(timezone.utc).isoformat(),
                }},
            )
            # Decrement stock
            try:
                await decrement_stock_for_order(order)
            except Exception as e:
                logger.error(f"Webhook stock decrement failed: {e}")
            updated_order = await db.orders.find_one({"razorpay_order_id": rzp_order_id}, {"_id": 0})
            if updated_order:
                try:
                    send_order_confirmation_email(updated_order)
                except Exception as e:
                    logger.error(f"Webhook confirmation email failed: {e}")
            logger.info(f"Payment captured via webhook: {rzp_order_id}")
        else:
            logger.info(f"Order already paid or not found: {rzp_order_id}")

    elif event == "payment.failed":
        payment = payload["payload"]["payment"]["entity"]
        rzp_order_id = payment.get("order_id")
        error_reason = payment.get("error_reason", "unknown")

        await db.orders.update_one(
            {"razorpay_order_id": rzp_order_id},
            {"$set": {
                "payment_status": "Failed",
                "order_status": "Payment Failed",
                "payment_error": error_reason,
                "webhook_verified_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
        logger.warning(f"Payment failed via webhook: {rzp_order_id} - {error_reason}")

    elif event == "order.paid":
        order_entity = payload["payload"]["order"]["entity"]
        rzp_order_id = order_entity.get("id")

        await db.orders.update_one(
            {"razorpay_order_id": rzp_order_id, "payment_status": {"$ne": "Paid"}},
            {"$set": {
                "payment_status": "Paid",
                "order_status": "Confirmed",
                "webhook_verified_at": datetime.now(timezone.utc).isoformat(),
            }},
        )
        logger.info(f"Order paid via webhook: {rzp_order_id}")

    return {"status": "ok"}

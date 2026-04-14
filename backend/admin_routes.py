from fastapi import APIRouter, Request, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
import bcrypt
import jwt
import os
import io
import csv
import uuid
import shutil
from datetime import datetime, timezone, timedelta
from pathlib import Path

admin_router = APIRouter(prefix="/api/admin")

JWT_SECRET = os.environ.get("JWT_SECRET", "mitti_basket_admin_jwt_secret_2026")
JWT_ALGORITHM = "HS256"
UPLOADS_DIR = Path(__file__).parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)


# ─── Auth Helpers ───

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_admin_user(request: Request):
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ─── Models ───

class AdminLogin(BaseModel):
    email: str
    password: str

class ProductCreate(BaseModel):
    name: str
    tagline: str = ""
    origin: str = ""
    basePrice: int
    unit: str = ""
    minQty: int = 1
    qtyStep: int = 1
    qtyUnit: str = "kg"
    badge: str = ""
    badge_type: str = ""
    badge_text: str = ""
    badge_color: str = ""
    subscribable: bool = False
    image: str = ""
    category: str = "village_pantry"
    comingSoon: bool = False
    inStock: bool = True
    availability_status: str = "AVAILABLE"
    stock_quantity: int = 100
    low_stock_threshold: int = 5
    next_harvest_window: str = ""
    show_harvest_window: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    origin: Optional[str] = None
    basePrice: Optional[int] = None
    unit: Optional[str] = None
    minQty: Optional[int] = None
    qtyStep: Optional[int] = None
    qtyUnit: Optional[str] = None
    badge: Optional[str] = None
    badge_type: Optional[str] = None
    badge_text: Optional[str] = None
    badge_color: Optional[str] = None
    subscribable: Optional[bool] = None
    image: Optional[str] = None
    category: Optional[str] = None
    comingSoon: Optional[bool] = None
    inStock: Optional[bool] = None
    availability_status: Optional[str] = None
    stock_quantity: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    next_harvest_window: Optional[str] = None
    show_harvest_window: Optional[bool] = None

class OrderStatusUpdate(BaseModel):
    order_status: str

class BulkOrderStatusUpdate(BaseModel):
    order_ids: List[str]
    new_status: str

class BroadcastEmail(BaseModel):
    subject: str
    body: str
    recipients: List[str] = []

class SettingsUpdate(BaseModel):
    minimum_order_enabled: Optional[bool] = None
    minimum_order_value: Optional[int] = None
    default_shipping_message: Optional[str] = None
    default_ofd_message: Optional[str] = None
    broadcast_sender_name: Optional[str] = None


# ─── Auth Routes ───

@admin_router.post("/login")
async def admin_login(data: AdminLogin, request: Request):
    db = request.app.state.db
    # Brute force check
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{data.email.lower()}"
    attempt = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0})
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = attempt.get("locked_until")
        if locked_until and datetime.now(timezone.utc).isoformat() < locked_until:
            raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})

    admin = await db.admin_users.find_one({"email": data.email.lower()}, {"_id": 0})
    if not admin or not verify_password(data.password, admin["password_hash"]):
        # Increment failed attempts
        if attempt:
            new_count = attempt.get("count", 0) + 1
            update = {"$set": {"count": new_count}}
            if new_count >= 5:
                update["$set"]["locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
            await db.login_attempts.update_one({"identifier": identifier}, update)
        else:
            await db.login_attempts.insert_one({"identifier": identifier, "count": 1})
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Clear failed attempts
    await db.login_attempts.delete_many({"identifier": identifier})

    token = create_token(admin["id"], admin["email"], "admin")
    return {"token": token, "email": admin["email"], "name": admin.get("name", "Admin")}

@admin_router.get("/me")
async def admin_me(request: Request):
    admin = await get_admin_user(request)
    return {"email": admin["email"], "role": admin["role"]}

@admin_router.post("/logout")
async def admin_logout():
    return {"status": "logged_out"}


# ─── Dashboard ───

@admin_router.get("/dashboard")
async def admin_dashboard(request: Request):
    await get_admin_user(request)
    db = request.app.state.db

    total_orders = await db.orders.count_documents({})
    paid_orders = await db.orders.count_documents({"payment_status": "Paid"})
    pending_orders = await db.orders.count_documents({"payment_status": "Pending"})
    failed_orders = await db.orders.count_documents({"payment_status": "Failed"})

    # Revenue
    pipeline = [
        {"$match": {"payment_status": "Paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$subtotal"}}},
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0

    # Top selling products
    top_pipeline = [
        {"$match": {"payment_status": "Paid"}},
        {"$unwind": "$items"},
        {"$group": {"_id": "$items.name", "count": {"$sum": 1}, "revenue": {"$sum": "$items.total_price"}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    top_products = await db.orders.aggregate(top_pipeline).to_list(5)

    # Recent orders
    recent = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)

    # Unique customers
    customer_count = len(await db.orders.distinct("email"))

    # Today's orders
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    today_orders = await db.orders.count_documents({"created_at": {"$gte": today_start}})

    # Revenue today
    today_revenue_pipeline = [
        {"$match": {"payment_status": "Paid", "created_at": {"$gte": today_start}}},
        {"$group": {"_id": None, "total": {"$sum": "$subtotal"}}},
    ]
    today_revenue_result = await db.orders.aggregate(today_revenue_pipeline).to_list(1)
    today_revenue = today_revenue_result[0]["total"] if today_revenue_result else 0

    # Repeat customers (ordered more than once)
    repeat_pipeline = [
        {"$group": {"_id": "$email", "order_count": {"$sum": 1}}},
        {"$match": {"order_count": {"$gt": 1}}},
        {"$count": "repeat"},
    ]
    repeat_result = await db.orders.aggregate(repeat_pipeline).to_list(1)
    repeat_customers = repeat_result[0]["repeat"] if repeat_result else 0

    return {
        "total_orders": total_orders,
        "paid_orders": paid_orders,
        "pending_orders": pending_orders,
        "failed_orders": failed_orders,
        "total_revenue": total_revenue,
        "today_revenue": today_revenue,
        "repeat_customers": repeat_customers,
        "top_products": [{"name": p["_id"], "count": p["count"], "revenue": p["revenue"]} for p in top_products],
        "recent_orders": recent,
        "customer_count": customer_count,
        "today_orders": today_orders,
    }


@admin_router.get("/dashboard/charts")
async def dashboard_charts(request: Request, days: int = 30):
    await get_admin_user(request)
    db = request.app.state.db

    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

    # Daily revenue (all orders, grouped by date)
    revenue_pipeline = [
        {"$match": {"created_at": {"$gte": cutoff}}},
        {"$addFields": {"date": {"$substr": ["$created_at", 0, 10]}}},
        {"$group": {
            "_id": "$date",
            "revenue": {"$sum": {"$cond": [{"$eq": ["$payment_status", "Paid"]}, "$subtotal", 0]}},
            "orders": {"$sum": 1},
            "paid": {"$sum": {"$cond": [{"$eq": ["$payment_status", "Paid"]}, 1, 0]}},
            "failed": {"$sum": {"$cond": [{"$eq": ["$payment_status", "Failed"]}, 1, 0]}},
        }},
        {"$sort": {"_id": 1}},
    ]
    daily = await db.orders.aggregate(revenue_pipeline).to_list(60)

    # Fill missing dates with zeros
    start = datetime.now(timezone.utc) - timedelta(days=days - 1)
    date_map = {d["_id"]: d for d in daily}
    chart_data = []
    for i in range(days):
        date_str = (start + timedelta(days=i)).strftime("%Y-%m-%d")
        entry = date_map.get(date_str, {})
        chart_data.append({
            "date": date_str,
            "revenue": entry.get("revenue", 0),
            "orders": entry.get("orders", 0),
            "paid": entry.get("paid", 0),
            "failed": entry.get("failed", 0),
        })

    # Category breakdown
    cat_pipeline = [
        {"$match": {"payment_status": "Paid"}},
        {"$unwind": "$items"},
        {"$group": {"_id": "$items.name", "revenue": {"$sum": "$items.total_price"}, "count": {"$sum": 1}}},
        {"$sort": {"revenue": -1}},
        {"$limit": 8},
    ]
    category_data = await db.orders.aggregate(cat_pipeline).to_list(8)

    # Order status distribution
    status_pipeline = [
        {"$group": {"_id": "$order_status", "count": {"$sum": 1}}},
    ]
    status_data = await db.orders.aggregate(status_pipeline).to_list(10)

    return {
        "daily": chart_data,
        "product_revenue": [{"name": c["_id"], "revenue": c["revenue"], "count": c["count"]} for c in category_data],
        "order_status": [{"status": s["_id"] or "Pending", "count": s["count"]} for s in status_data],
    }


# ─── Product CRUD ───

@admin_router.get("/products")
async def list_products(request: Request):
    await get_admin_user(request)
    db = request.app.state.db
    products = await db.products.find({}, {"_id": 0}).sort("category", 1).to_list(100)
    return products

@admin_router.post("/products")
async def create_product(data: ProductCreate, request: Request):
    await get_admin_user(request)
    db = request.app.state.db
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "inStock": True,
        "created_at": now,
        "updated_at": now,
    }
    await db.products.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}

@admin_router.put("/products/{product_id}")
async def update_product(product_id: str, data: ProductUpdate, request: Request, background_tasks: BackgroundTasks):
    await get_admin_user(request)
    db = request.app.state.db
    current = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not current:
        raise HTTPException(status_code=404, detail="Product not found")
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    # Auto-set SOLD_OUT if stock drops to 0
    if "stock_quantity" in updates and updates["stock_quantity"] == 0:
        updates["availability_status"] = "SOLD_OUT"
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.update_one({"id": product_id}, {"$set": updates})
    # Notify waitlist when product becomes AVAILABLE
    new_avail = updates.get("availability_status")
    old_avail = current.get("availability_status", "AVAILABLE")
    if new_avail == "AVAILABLE" and old_avail in ("SOLD_OUT", "COMING_SOON"):
        background_tasks.add_task(notify_waitlist_for_product, product_id, current.get("name", ""))
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return product


async def notify_waitlist_for_product(product_id: str, product_name: str):
    from routes.emails import send_product_available_email
    from routes import db as rdb
    entries = await rdb.product_waitlist.find(
        {"product_id": product_id, "notified_at": None}
    ).to_list(1000)
    now = datetime.now(timezone.utc).isoformat()
    for entry in entries:
        send_product_available_email(entry["email"], product_name)
        await rdb.product_waitlist.update_one(
            {"product_id": entry["product_id"], "email": entry["email"], "notified_at": None},
            {"$set": {"notified_at": now}}
        )

@admin_router.delete("/products/{product_id}")
async def delete_product(product_id: str, request: Request):
    await get_admin_user(request)
    db = request.app.state.db
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "deleted"}

@admin_router.patch("/products/{product_id}/stock")
async def toggle_stock(product_id: str, request: Request):
    await get_admin_user(request)
    db = request.app.state.db
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    new_stock = not product.get("inStock", True)
    await db.products.update_one(
        {"id": product_id},
        {"$set": {"inStock": new_stock, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    return {"id": product_id, "inStock": new_stock}


# ─── Order Management ───

@admin_router.get("/orders/export")
async def export_orders_csv(request: Request):
    await get_admin_user(request)
    db = request.app.state.db
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Order ID", "Date", "Customer Name", "Email", "Phone", "Address", "Pincode",
        "Items", "Subtotal", "Payment Status", "Order Status",
        "Razorpay Order ID", "Razorpay Payment ID", "Shipped At", "Delivered At",
    ])
    for o in orders:
        items_str = "; ".join(
            f"{i.get('name', '')} x{i.get('quantity', 1)} (Rs.{i.get('total_price', 0)})"
            for i in o.get("items", [])
        )
        writer.writerow([
            o.get("id", ""), o.get("created_at", "")[:10], o.get("name", ""),
            o.get("email", ""), o.get("phone", ""), o.get("address", ""), o.get("pincode", ""),
            items_str, o.get("subtotal", 0), o.get("payment_status", "Pending"),
            o.get("order_status", "Pending"), o.get("razorpay_order_id", ""),
            o.get("razorpay_payment_id", ""), o.get("shipped_at", ""), o.get("delivered_at", ""),
        ])

    output.seek(0)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=mitti_basket_orders_{today}.csv"},
    )

@admin_router.get("/orders")
async def list_orders(request: Request, status: Optional[str] = None, payment: Optional[str] = None):
    await get_admin_user(request)
    db = request.app.state.db
    query = {}
    if status:
        query["order_status"] = status
    if payment:
        query["payment_status"] = payment
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders

@admin_router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, data: OrderStatusUpdate, request: Request, background_tasks: BackgroundTasks):
    await get_admin_user(request)
    db = request.app.state.db
    now = datetime.now(timezone.utc).isoformat()
    updates = {"order_status": data.order_status, "updated_at": now}
    if data.order_status == "Shipped":
        updates["shipped_at"] = now
    elif data.order_status == "Delivered":
        updates["delivered_at"] = now
    elif data.order_status == "Out for Delivery":
        updates["out_for_delivery_at"] = now
    result = await db.orders.update_one({"id": order_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if data.order_status in ("Shipped", "Out for Delivery", "Delivered"):
        settings = await db.settings.find_one({}, {"_id": 0}) or DEFAULT_SETTINGS
        from routes.emails import send_shipped_email, send_out_for_delivery_email, send_delivered_email            
        background_tasks.add_task(send_shipped_email, order, settings.get("default_shipping_message", DEFAULT_SETTINGS["default_shipping_message"]))
    elif data.order_status == "Out for Delivery":
            background_tasks.add_task(send_out_for_delivery_email, order, settings.get("default_ofd_message", DEFAULT_SETTINGS["default_ofd_message"]))
    elif data.order_status == "Delivered":
            background_tasks.add_task(send_delivered_email, order)
    return order


# ─── Customers ───

@admin_router.get("/customers")
async def list_customers(request: Request):
    await get_admin_user(request)
    db = request.app.state.db
    pipeline = [
        {"$group": {
            "_id": "$email",
            "name": {"$first": "$name"},
            "phone": {"$first": "$phone"},
            "address": {"$first": "$address"},
            "total_orders": {"$sum": 1},
            "total_spent": {"$sum": {"$cond": [{"$eq": ["$payment_status", "Paid"]}, "$subtotal", 0]}},
            "last_order": {"$max": "$created_at"},
        }},
        {"$sort": {"total_spent": -1}},
    ]
    customers = await db.orders.aggregate(pipeline).to_list(500)
    return [{"email": c["_id"], "name": c["name"], "phone": c["phone"], "address": c["address"],
             "total_orders": c["total_orders"], "total_spent": c["total_spent"], "last_order": c["last_order"]}
            for c in customers]


# ─── Subscribers ───

@admin_router.get("/subscribers")
async def list_subscribers(request: Request):
    await get_admin_user(request)
    db = request.app.state.db
    entries = await db.waitlist.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)
    return entries

@admin_router.get("/subscribers/export")
async def export_subscribers_csv(request: Request):
    await get_admin_user(request)
    db = request.app.state.db
    entries = await db.waitlist.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Email", "Name", "Type", "Date"])
    for e in entries:
        writer.writerow([e.get("email", ""), e.get("name", ""), e.get("waitlist_type", ""), e.get("created_at", "")[:10]])

    output.seek(0)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=mitti_basket_subscribers_{today}.csv"},
    )


# ─── Image Upload ───

@admin_router.post("/upload")
async def upload_image(request: Request, file: UploadFile = File(...)):
    await get_admin_user(request)
    ext = Path(file.filename).suffix.lower()
    if ext not in (".jpg", ".jpeg", ".png", ".webp"):
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP allowed")
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = UPLOADS_DIR / filename
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return {"url": f"/api/uploads/{filename}"}


# ─── Settings ───

DEFAULT_SETTINGS = {
    "minimum_order_enabled": True,
    "minimum_order_value": 1200,
    "default_shipping_message": "Your order will be delivered in 3-5 business days.",
    "default_ofd_message": "Your farm basket is arriving today!",
    "broadcast_sender_name": "Mitti Basket",
}

@admin_router.get("/settings")
async def get_settings(request: Request):
    await get_admin_user(request)
    db = request.app.state.db
    settings = await db.settings.find_one({}, {"_id": 0})
    if not settings:
        return DEFAULT_SETTINGS
    return {k: v for k, v in settings.items() if k != "_id"}

@admin_router.put("/settings")
async def update_settings(data: SettingsUpdate, request: Request):
    await get_admin_user(request)
    db = request.app.state.db
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.settings.update_one({}, {"$set": updates}, upsert=True)
    settings = await db.settings.find_one({}, {"_id": 0})
    return {k: v for k, v in settings.items() if k != "_id"}


# ─── Bulk Order Status ───

@admin_router.post("/orders/bulk-status")
async def bulk_update_order_status(data: BulkOrderStatusUpdate, request: Request, background_tasks: BackgroundTasks):
    await get_admin_user(request)
    db = request.app.state.db
    valid = ["Placed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Failed"]
    if data.new_status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid}")
    now = datetime.now(timezone.utc).isoformat()
    updates = {"order_status": data.new_status, "updated_at": now}
    if data.new_status == "Shipped":
        updates["shipped_at"] = now
    elif data.new_status == "Delivered":
        updates["delivered_at"] = now
    elif data.new_status == "Out for Delivery":
        updates["out_for_delivery_at"] = now
    result = await db.orders.update_many({"id": {"$in": data.order_ids}}, {"$set": updates})
    # Trigger emails for shipping statuses
    if data.new_status in ("Shipped", "Out for Delivery","Delivered"):
        orders = await db.orders.find({"id": {"$in": data.order_ids}}, {"_id": 0}).to_list(len(data.order_ids))
        settings = await db.settings.find_one({}, {"_id": 0}) or DEFAULT_SETTINGS
        from routes.emails import send_shipped_email, send_out_for_delivery_email, send_delivered_email
        for order in orders:
            if data.new_status == "Shipped":
                background_tasks.add_task(send_shipped_email, order, settings.get("default_shipping_message", DEFAULT_SETTINGS["default_shipping_message"]))
            elif data.new_status == "Out for Delivery":
                background_tasks.add_task(send_out_for_delivery_email, order, settings.get("default_ofd_message", DEFAULT_SETTINGS["default_ofd_message"]))
            elif data.new_status == "Delivered":
                background_tasks.add_task(send_delivered_email, order)
    return {"status": "success", "updated_count": result.modified_count}


# ─── Broadcast Email ───

@admin_router.post("/broadcast")
async def send_broadcast(data: BroadcastEmail, request: Request, background_tasks: BackgroundTasks):
    await get_admin_user(request)
    db = request.app.state.db
    settings = await db.settings.find_one({}, {"_id": 0})
    sender_name = (settings or {}).get("broadcast_sender_name", "Mitti Basket")
    if data.recipients:
        emails = data.recipients
    else:
        order_emails = await db.orders.distinct("email")
        subscriber_emails = await db.waitlist.distinct("email")
        emails = list(set(order_emails + subscriber_emails))
    from routes.emails import send_broadcast_email_message
    for email in emails:
        background_tasks.add_task(send_broadcast_email_message, email, data.subject, data.body, sender_name)
    return {"status": "success", "recipients_count": len(emails)}

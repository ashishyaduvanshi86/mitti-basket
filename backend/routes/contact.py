"""Contact form & waitlist routes."""
from fastapi import APIRouter
import uuid
import logging
from datetime import datetime, timezone
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from routes import db, SENDER_EMAIL
from routes.emails import send_brevo_email, send_contact_email

logger = logging.getLogger("mitti_basket")
router = APIRouter()


# ─── Models ───

class WaitlistEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: Optional[str] = None
    waitlist_type: str = "subscription"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class WaitlistCreate(BaseModel):
    email: str
    name: Optional[str] = None
    waitlist_type: str = "subscription"

class ContactCreate(BaseModel):
    name: str
    email: str
    phone: str
    message: str


# ─── Routes ───

@router.post("/waitlist", response_model=WaitlistEntry)
async def create_waitlist_entry(input_data: WaitlistCreate):
    existing = await db.waitlist.find_one(
        {"email": input_data.email, "waitlist_type": input_data.waitlist_type}, {"_id": 0}
    )
    if existing:
        return WaitlistEntry(**existing)
    entry = WaitlistEntry(**input_data.model_dump())
    await db.waitlist.insert_one(entry.model_dump())
    try:
        send_brevo_email(input_data.email, "Welcome to Mitti Basket", """
        <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;background:#FAF7F2;padding:40px 32px;">
            <h1 style="font-size:28px;color:#3A5A40;margin-bottom:8px;">Mitti Basket</h1>
            <div style="width:40px;height:2px;background:#DDB892;margin-bottom:24px;"></div>
            <p style="font-size:16px;color:#1A1A1A;line-height:1.8;">Thank you for joining Mitti Basket.</p>
            <p style="font-size:13px;color:#9CA3AF;">From India's soil to your home.<br>&mdash; Team Mitti Basket</p>
        </div>""")
    except Exception as e:
        logger.error(f"Email failed: {e}")

    # Notify admin
    try:
        type_label = input_data.waitlist_type.replace("_", " ").title()
        send_brevo_email(SENDER_EMAIL, f"New Subscriber: {input_data.email}", f"""
        <div style="font-family:'Georgia',serif;max-width:600px;margin:0 auto;background:#1A1A1A;padding:40px 32px;">
            <h1 style="font-size:24px;color:#DDB892;margin-bottom:4px;">New Subscriber</h1>
            <div style="width:40px;height:2px;background:#DDB892;margin-bottom:24px;"></div>
            <div style="background:#2A2A2A;padding:20px;border:1px solid #333;">
                <p style="font-size:15px;color:white;margin:0 0 6px 0;"><strong>Email:</strong> {input_data.email}</p>
                <p style="font-size:15px;color:white;margin:0 0 6px 0;"><strong>Name:</strong> {input_data.name or '—'}</p>
                <p style="font-size:15px;color:white;margin:0;"><strong>Type:</strong> {type_label}</p>
            </div>
            <p style="font-size:11px;color:#555;margin-top:16px;">{entry.created_at[:10]}</p>
        </div>""")
    except Exception as e:
        logger.error(f"Admin notification failed: {e}")

    return entry

@router.get("/waitlist", response_model=List[WaitlistEntry])
async def get_waitlist_entries():
    entries = await db.waitlist.find({}, {"_id": 0}).to_list(1000)
    return [WaitlistEntry(**e) for e in entries]

@router.post("/contact")
async def contact_form(input_data: ContactCreate):
    doc = {
        "id": str(uuid.uuid4()),
        "name": input_data.name,
        "email": input_data.email,
        "phone": input_data.phone,
        "message": input_data.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contact_messages.insert_one(doc)
    try:
        send_contact_email(input_data.name, input_data.email, input_data.phone, input_data.message)
    except Exception as e:
        logger.error(f"Contact email failed: {e}")
    return {"status": "sent", "id": doc["id"]}

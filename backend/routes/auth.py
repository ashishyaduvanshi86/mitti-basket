from fastapi import APIRouter, HTTPException
from routes import verified_phones
from datetime import datetime

router = APIRouter()


@router.post("/verify-phone")
async def verify_phone(payload: dict):
    phone = payload.get("phone")

    if not phone:
        raise HTTPException(status_code=400, detail="Phone required")

    verified_phones.update_one(
        {"phone": phone},
        {
            "$set": {
                "phone": phone,
                "verified": True,
                "verified_at": datetime.utcnow(),
            }
        },
        upsert=True,
    )

    return {"status": "verified"}


@router.post("/check-phone-verified")
async def check_phone_verified(payload: dict):
    phone = payload.get("phone")

    if not phone:
        return {"verified": False}

    record = verified_phones.find_one({"phone": phone})

    return {"verified": bool(record)}
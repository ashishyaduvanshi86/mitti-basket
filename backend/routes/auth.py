from fastapi import APIRouter, HTTPException
from routes import verified_phones
from datetime import datetime

router = APIRouter()


@router.post("/verify-phone")
async def verify_phone(payload: dict):
    token = payload.get("token")
    phone = payload.get("phone")

    if not token or not phone:
        raise HTTPException(status_code=400, detail="Token and phone required")

    # TODO: optional — verify token with MSG91 if needed later

    verified_phones.update_one(
        {"phone": phone},
        {
            "$set": {
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
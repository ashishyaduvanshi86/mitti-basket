from fastapi import APIRouter, HTTPException
from routes import db

router = APIRouter()


@router.post("/verify-phone")
async def verify_phone(payload: dict):

    phone = payload.get("mobile")

    if not phone:
        raise HTTPException(status_code=400, detail="Phone missing")

    db.users.update_one(
        {"phone": phone},
        {
            "$set": {
                "phone": phone,
                "phone_verified": True
            }
        },
        upsert=True
    )

    return {"message": "Phone verified successfully"}
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.models.user import User
from app.models.subscription import Subscription
from app.auth.jwt import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/subscription", tags=["Subscription"])

PLANS = {
    "free": {
        "name": "Free",
        "price": 0,
        "currency": "INR",
        "features": [
            "3 ATS Analyses",
            "3 Cover Letters",
            "2 Resume Templates",
            "Basic Dashboard"
        ],
        "limits": {
            "ats_analyses": 3,
            "cover_letters": 3,
            "ai_credits": 10
        }
    },
    "pro": {
        "name": "Pro",
        "price": 99,
        "currency": "INR",
        "features": [
            "Unlimited ATS Analyses",
            "Unlimited Cover Letters",
            "All Premium Templates",
            "Portfolio Generator",
            "AI Career Advisor",
            "Priority Support"
        ],
        "limits": {
            "ats_analyses": -1,  # Unlimited
            "cover_letters": -1,
            "ai_credits": 100
        }
    },
    "premium": {
        "name": "Premium",
        "price": 199,
        "currency": "INR",
        "features": [
            "Everything in Pro",
            "LinkedIn Profile Import",
            "GitHub Profile Import",
            "AI Skill Gap Analysis",
            "Career Roadmap",
            "Team Collaboration",
            "White-label Portfolio",
            "24/7 Priority Support"
        ],
        "limits": {
            "ats_analyses": -1,
            "cover_letters": -1,
            "ai_credits": -1  # Unlimited
        }
    }
}


class UpgradeRequest(BaseModel):
    plan: str
    payment_id: str = None


@router.get("/plans")
async def get_plans():
    return PLANS


@router.get("/me")
async def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).first()

    if not subscription:
        return {"plan": "free", "status": "active"}

    plan_info = PLANS.get(subscription.plan, PLANS["free"])
    return {
        "id": str(subscription.id),
        "plan": subscription.plan,
        "plan_name": plan_info["name"],
        "status": subscription.status,
        "expiry_date": subscription.expiry_date,
        "features": plan_info["features"],
        "limits": plan_info["limits"],
        "usage": {
            "ats_analyses": subscription.ats_analyses_used,
            "cover_letters": subscription.cover_letters_used,
            "ai_credits": subscription.ai_credits_used
        }
    }


@router.post("/upgrade")
async def upgrade_subscription(
    data: UpgradeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.plan not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")

    plan_config = PLANS[data.plan]
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).first()

    expiry = datetime.now(timezone.utc) + timedelta(days=30)

    if subscription:
        subscription.plan = data.plan
        subscription.status = "active"
        subscription.expiry_date = expiry
        subscription.payment_id = data.payment_id
        subscription.amount_paid = str(plan_config["price"])
        limits = plan_config["limits"]
        subscription.ats_analyses_limit = str(limits["ats_analyses"])
        subscription.cover_letters_limit = str(limits["cover_letters"])
        subscription.ai_credits_limit = str(limits["ai_credits"])
    else:
        limits = plan_config["limits"]
        subscription = Subscription(
            user_id=current_user.id,
            plan=data.plan,
            status="active",
            expiry_date=expiry,
            payment_id=data.payment_id,
            amount_paid=str(plan_config["price"]),
            ats_analyses_limit=str(limits["ats_analyses"]),
            cover_letters_limit=str(limits["cover_letters"]),
            ai_credits_limit=str(limits["ai_credits"])
        )
        db.add(subscription)

    db.commit()
    return {"message": f"Upgraded to {data.plan} plan", "plan": data.plan}

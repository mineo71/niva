from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.auth.models import User
from app.core.db import get_db
from app.fields.models import Field

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("")
def dashboard_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total_fields = db.scalar(select(func.count(Field.id)).where(Field.owner_id == user.id)) or 0
    total_area = db.scalar(
        select(func.coalesce(func.sum(Field.area_ha), 0.0)).where(Field.owner_id == user.id)
    )
    crops = db.scalars(select(Field.crop_type).where(Field.owner_id == user.id)).all()
    crop_dist = [{"crop": c, "count": n} for c, n in Counter(crops).items()]
    return {
        "total_fields": total_fields,
        "total_area_ha": round(float(total_area), 2),
        "crop_distribution": crop_dist,
    }

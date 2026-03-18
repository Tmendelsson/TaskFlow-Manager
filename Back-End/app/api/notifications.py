from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models.notification import Notification
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def _serialize_notification(notification: Notification) -> dict:
    return {
        "id": notification.id,
        "message": notification.message,
        "is_read": notification.is_read,
        "user_id": notification.user_id,
        "text": notification.message,
        "read": notification.is_read,
        "time": "agora",
        "color": "#6366f1",
    }


@router.get("")
def list_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.id.desc())
        .all()
    )
    return [_serialize_notification(notification) for notification in notifications]


@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return _serialize_notification(notification)


@router.patch("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read.is_(False)).all()
    updated = 0
    for notification in notifications:
        notification.is_read = True
        updated += 1

    db.commit()
    return {"updated": updated}

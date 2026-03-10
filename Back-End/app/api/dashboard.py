from sqlalchemy import func, select
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models.project import Project
from app.models.task import Task
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project_ids = select(Project.id).where(Project.owner_id == current_user.id)

    total_projects = db.query(func.count(Project.id)).filter(Project.owner_id == current_user.id).scalar() or 0
    total_tasks = db.query(func.count(Task.id)).filter(Task.project_id.in_(project_ids)).scalar() or 0

    by_status_rows = (
        db.query(Task.status, func.count(Task.id))
        .filter(Task.project_id.in_(project_ids))
        .group_by(Task.status)
        .all()
    )
    by_status = {status: count for status, count in by_status_rows}

    return {
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "by_status": {
            "TODO": by_status.get("TODO", 0),
            "IN_PROGRESS": by_status.get("IN_PROGRESS", 0),
            "DONE": by_status.get("DONE", 0),
        },
    }

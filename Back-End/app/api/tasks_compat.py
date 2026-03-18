import os
import shutil
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db import get_db
from app.dependencies import get_current_user
from app.models.attachment import Attachment
from app.models.comment import Comment
from app.models.notification import Notification
from app.models.project import Project
from app.models.task import TASK_STATUS, Task
from app.models.user import User
from app.schemas.attachment import AttachmentResponse
from app.schemas.comment import CommentResponse
from app.schemas.task import TaskResponse, TaskUpdate

router = APIRouter(tags=["Tasks Compatibility"])


class TaskStatusUpdate(BaseModel):
    status: str


class CommentCreateCompat(BaseModel):
    content: str | None = None
    text: str | None = None


def _task_or_404(task_id: int, user_id: int, db: Session) -> Task:
    task = (
        db.query(Task)
        .join(Project, Task.project_id == Project.id)
        .filter(Task.id == task_id, Project.owner_id == user_id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


def _comment_or_404(comment_id: int, user_id: int, db: Session) -> Comment:
    comment = (
        db.query(Comment)
        .join(Task, Comment.task_id == Task.id)
        .join(Project, Task.project_id == Project.id)
        .filter(Comment.id == comment_id, Project.owner_id == user_id)
        .first()
    )
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _task_or_404(task_id, current_user.id, db)


@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task_flat(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _task_or_404(task_id, current_user.id, db)
    updates = payload.model_dump(exclude_unset=True)

    if "status" in updates and updates["status"] not in TASK_STATUS:
        raise HTTPException(status_code=400, detail="Invalid status")

    previous_status = task.status

    for key, value in updates.items():
        setattr(task, key, value)

    if "status" in updates and task.assignee_id and task.status != previous_status:
        db.add(
            Notification(
                user_id=task.assignee_id,
                message=f"Task '{task.title}' moved to {task.status}",
            )
        )

    db.commit()
    db.refresh(task)
    return task


@router.patch("/tasks/{task_id}/status", response_model=TaskResponse)
def update_task_status_flat(
    task_id: int,
    payload: TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.status not in TASK_STATUS:
        raise HTTPException(status_code=400, detail="Invalid status")

    task = _task_or_404(task_id, current_user.id, db)
    previous_status = task.status
    task.status = payload.status

    if task.assignee_id and previous_status != task.status:
        db.add(
            Notification(
                user_id=task.assignee_id,
                message=f"Task '{task.title}' moved to {task.status}",
            )
        )

    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_flat(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _task_or_404(task_id, current_user.id, db)
    db.delete(task)
    db.commit()


@router.get("/tasks/{task_id}/comments", response_model=list[CommentResponse])
def list_comments_flat(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _task_or_404(task_id, current_user.id, db)
    return db.query(Comment).filter(Comment.task_id == task_id).all()


@router.post("/tasks/{task_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment_flat(
    task_id: int,
    payload: CommentCreateCompat,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _task_or_404(task_id, current_user.id, db)
    content = (payload.content or payload.text or "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Comment content is required")

    comment = Comment(content=content, task_id=task_id, author_id=current_user.id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment_flat(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = _comment_or_404(comment_id, current_user.id, db)
    db.delete(comment)
    db.commit()


@router.post("/tasks/{task_id}/attachments", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
def upload_attachment_flat(
    task_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _task_or_404(task_id, current_user.id, db)

    os.makedirs(settings.upload_dir, exist_ok=True)
    extension = os.path.splitext(file.filename)[1]
    safe_name = f"{uuid.uuid4().hex}{extension}"
    saved_path = os.path.join(settings.upload_dir, safe_name)

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    attachment = Attachment(file_name=file.filename, file_path=safe_name, task_id=task_id)
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment


@router.get("/tasks/{task_id}/attachments", response_model=list[AttachmentResponse])
def list_attachments_flat(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _task_or_404(task_id, current_user.id, db)
    return db.query(Attachment).filter(Attachment.task_id == task_id).all()

import os
import shutil
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
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
from app.schemas.comment import CommentCreate, CommentResponse
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(prefix="/projects/{project_id}/tasks", tags=["Tasks"])


def _project_or_404(project_id: int, user_id: int, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == user_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    project_id: int,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _project_or_404(project_id, current_user.id, db)

    if payload.status not in TASK_STATUS:
        raise HTTPException(status_code=400, detail="Invalid status")

    task = Task(
        title=payload.title,
        description=payload.description,
        status=payload.status,
        assignee_id=payload.assignee_id,
        project_id=project_id,
    )
    db.add(task)
    db.flush()

    if task.assignee_id:
        db.add(
            Notification(
                user_id=task.assignee_id,
                message=f"New task assigned: {task.title}",
            )
        )

    db.commit()
    db.refresh(task)
    return task


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    project_id: int,
    assignee_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _project_or_404(project_id, current_user.id, db)

    query = db.query(Task).filter(Task.project_id == project_id)
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)
    return query.all()


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    project_id: int,
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _project_or_404(project_id, current_user.id, db)
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    updates = payload.model_dump(exclude_unset=True)
    if "status" in updates and updates["status"] not in TASK_STATUS:
        raise HTTPException(status_code=400, detail="Invalid status")

    previous_status = task.status
    previous_assignee_id = task.assignee_id

    for key, value in updates.items():
        setattr(task, key, value)

    if "assignee_id" in updates and task.assignee_id and task.assignee_id != previous_assignee_id:
        db.add(
            Notification(
                user_id=task.assignee_id,
                message=f"Task assigned to you: {task.title}",
            )
        )

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


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _project_or_404(project_id, current_user.id, db)
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()


@router.post("/{task_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    project_id: int,
    task_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _project_or_404(project_id, current_user.id, db)
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    comment = Comment(content=payload.content, task_id=task_id, author_id=current_user.id)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.get("/{task_id}/comments", response_model=list[CommentResponse])
def list_comments(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _project_or_404(project_id, current_user.id, db)
    return db.query(Comment).filter(Comment.task_id == task_id).all()


@router.post("/{task_id}/attachments", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
def upload_attachment(
    project_id: int,
    task_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _project_or_404(project_id, current_user.id, db)
    task = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

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


@router.get("/{task_id}/attachments", response_model=list[AttachmentResponse])
def list_attachments(
    project_id: int,
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _project_or_404(project_id, current_user.id, db)
    return db.query(Attachment).filter(Attachment.task_id == task_id).all()

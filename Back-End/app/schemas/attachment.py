from pydantic import BaseModel


class AttachmentResponse(BaseModel):
    id: int
    file_name: str
    file_path: str
    task_id: int

    class Config:
        from_attributes = True

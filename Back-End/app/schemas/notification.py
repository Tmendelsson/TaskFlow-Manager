from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: bool
    user_id: int

    class Config:
        from_attributes = True

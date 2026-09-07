import uuid
from datetime import datetime
from typing import List

from pydantic import BaseModel, EmailStr


class GroupCreate(BaseModel):
    name: str
    member_emails: List[str] = []  # invite existing users by email at creation time


class GroupOut(BaseModel):
    id: uuid.UUID
    name: str
    created_by: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class GroupMemberOut(BaseModel):
    user_id: uuid.UUID
    name: str
    email: EmailStr
    joined_at: datetime

    class Config:
        from_attributes = True

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

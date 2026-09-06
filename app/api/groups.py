import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_db
from app.models.group import Group, GroupMember
from app.models.user import User
from app.schemas.group import GroupCreate, GroupOut

router = APIRouter(prefix="/groups", tags=["groups"])


@router.post("", response_model=GroupOut, status_code=201)
def create_group(payload: GroupCreate, created_by: uuid.UUID, db: Session = Depends(get_db)):
    # NOTE: created_by is a query param placeholder until auth (get_current_user) is wired in.
    group = Group(name=payload.name, created_by=created_by)
    db.add(group)
    db.flush()

    member_ids = {created_by}
    if payload.member_emails:
        users = db.query(User).filter(User.email.in_(payload.member_emails)).all()
        member_ids.update(u.id for u in users)

    for uid in member_ids:
        db.add(GroupMember(group_id=group.id, user_id=uid))

    db.commit()
    db.refresh(group)
    return group


@router.get("/{group_id}", response_model=GroupOut)
def get_group(group_id: uuid.UUID, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

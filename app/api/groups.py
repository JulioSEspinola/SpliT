import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.group import GroupCreate, GroupMemberOut, GroupOut
from app.services import group_service

router = APIRouter(prefix="/groups", tags=["groups"])


@router.post("", response_model=GroupOut, status_code=201)
def create_group(
    payload: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return group_service.create_group(db, payload, created_by=current_user.id)


@router.get("", response_model=List[GroupOut])
def list_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return group_service.list_groups_for_user(db, current_user.id)


@router.get("/{group_id}", response_model=GroupOut)
def get_group(
    group_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_membership(db, group_id, current_user.id)
    group = group_service.get_group(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


@router.get("/{group_id}/members", response_model=List[GroupMemberOut])
def get_group_members(
    group_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _require_membership(db, group_id, current_user.id)
    members = group_service.list_group_members(db, group_id)
    return [
        GroupMemberOut(user_id=m.user_id, name=m.user.name, email=m.user.email, joined_at=m.joined_at)
        for m in members
    ]


def _require_membership(db: Session, group_id: uuid.UUID, user_id: uuid.UUID) -> None:
    if not group_service.is_group_member(db, group_id, user_id):
        raise HTTPException(status_code=404, detail="Group not found")

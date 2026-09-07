import uuid

from sqlalchemy.orm import Session, joinedload

from app.models.group import Group, GroupMember
from app.models.user import User
from app.schemas.group import GroupCreate


def create_group(db: Session, payload: GroupCreate, created_by: uuid.UUID) -> Group:
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


def get_group(db: Session, group_id: uuid.UUID) -> Group | None:
    return db.query(Group).filter(Group.id == group_id).first()


def list_groups_for_user(db: Session, user_id: uuid.UUID) -> list[Group]:
    return (
        db.query(Group)
        .join(GroupMember, GroupMember.group_id == Group.id)
        .filter(GroupMember.user_id == user_id)
        .all()
    )


def list_group_members(db: Session, group_id: uuid.UUID) -> list[GroupMember]:
    return (
        db.query(GroupMember)
        .options(joinedload(GroupMember.user))
        .filter(GroupMember.group_id == group_id)
        .all()
    )


def is_group_member(db: Session, group_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    return (
        db.query(GroupMember)
        .filter(GroupMember.group_id == group_id, GroupMember.user_id == user_id)
        .first()
        is not None
    )

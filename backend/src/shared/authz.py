"""Authorization helpers for Cognito/API Gateway events."""

from __future__ import annotations

import json
import re
from typing import Any, Iterable

from .repository import SmisRepository

PLATFORM_ADMIN = "PlatformAdmin"
SCHOOL_ADMIN = "SchoolAdmin"
FINANCE_OFFICER = "FinanceOfficer"
TEACHER = "Teacher"
STUDENT = "Student"
PARENT_GUARDIAN = "ParentGuardian"


def claims(event: dict[str, Any]) -> dict[str, Any]:
    return (
        event.get("requestContext", {})
        .get("authorizer", {})
        .get("jwt", {})
        .get("claims", {})
        or {}
    )


def caller_sub(event: dict[str, Any]) -> str | None:
    value = claims(event).get("sub")
    return value if isinstance(value, str) and value else None


def _clean_group(value: Any) -> str | None:
    if not isinstance(value, str):
        return None
    cleaned = value.strip().strip("'\"")
    return cleaned or None


def caller_groups(event: dict[str, Any]) -> tuple[str, ...]:
    value = claims(event).get("cognito:groups", [])
    if isinstance(value, list):
        return tuple(group for group in (_clean_group(item) for item in value) if group)
    if isinstance(value, str):
        stripped = value.strip()
        if stripped.startswith("["):
            try:
                parsed = json.loads(stripped)
            except json.JSONDecodeError:
                parsed = None
            if isinstance(parsed, list):
                return tuple(group for group in (_clean_group(item) for item in parsed) if group)
        return tuple(
            group
            for group in (_clean_group(part) for part in re.split(r"[\s,]+", stripped.strip("[]")))
            if group
        )
    return ()


def caller_school_id(event: dict[str, Any]) -> str | None:
    value = claims(event).get("custom:school_id") or claims(event).get("school_id")
    return value if isinstance(value, str) and value else None


def has_any_group(event: dict[str, Any], allowed: Iterable[str]) -> bool:
    groups = set(caller_groups(event))
    return any(group in groups for group in allowed)


def is_platform_admin(event: dict[str, Any]) -> bool:
    return has_any_group(event, [PLATFORM_ADMIN])


def can_access_school(event: dict[str, Any], school_id: str, repo: SmisRepository | None = None) -> bool:
    if is_platform_admin(event):
        return True
    sub = caller_sub(event)
    if not sub:
        return False
    if caller_school_id(event) == school_id:
        return True
    if repo is not None:
        membership = repo.get_membership(sub, school_id)
        if membership and membership.get("status") == "active":
            return True
    return False


def can_manage_school(event: dict[str, Any], school_id: str, repo: SmisRepository | None = None) -> bool:
    if is_platform_admin(event):
        return True
    if not has_any_group(event, [SCHOOL_ADMIN]):
        return False
    sub = caller_sub(event)
    if not sub:
        return False
    if caller_school_id(event) == school_id:
        return True
    if repo is not None:
        membership = repo.get_membership(sub, school_id)
        if membership and membership.get("status") == "active" and membership.get("role") == SCHOOL_ADMIN:
            return True
    return False

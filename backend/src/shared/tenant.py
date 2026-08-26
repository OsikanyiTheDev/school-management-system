"""Tenant key and authorization helpers.

The SMIS data model is multi-tenant from the beginning. Application-owned
records must carry ``school_id`` and use partition keys that keep one school's
records scoped together.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable

SCHOOL_ID_RE = re.compile(r"^sch_[a-z0-9][a-z0-9_-]{2,48}$")
ENTITY_ID_RE = re.compile(r"^[a-z]{2,16}_[a-z0-9][a-z0-9_-]{2,64}$")

ROLE_GROUPS = {
    "PlatformAdmin",
    "SchoolAdmin",
    "Teacher",
    "Student",
    "ParentGuardian",
    "FinanceOfficer",
}


@dataclass(frozen=True)
class TenantContext:
    school_id: str
    user_sub: str
    groups: tuple[str, ...]

    def has_any_role(self, allowed: Iterable[str]) -> bool:
        return any(role in self.groups for role in allowed)


def is_valid_school_id(value: str) -> bool:
    return bool(SCHOOL_ID_RE.fullmatch(value))


def is_valid_entity_id(value: str) -> bool:
    return bool(ENTITY_ID_RE.fullmatch(value))


def tenant_pk(school_id: str, entity: str) -> str:
    if not is_valid_school_id(school_id):
        raise ValueError("invalid school_id")
    return f"SCHOOL#{school_id}#{entity.upper()}"


def entity_sk(entity_id: str) -> str:
    if not is_valid_entity_id(entity_id):
        raise ValueError("invalid entity_id")
    return f"ID#{entity_id}"


def membership_pk(user_sub: str) -> str:
    if not user_sub:
        raise ValueError("user_sub is required")
    return f"USER#{user_sub}"


def membership_sk(school_id: str) -> str:
    if not is_valid_school_id(school_id):
        raise ValueError("invalid school_id")
    return f"SCHOOL#{school_id}"


def role_is_known(role: str) -> bool:
    return role in ROLE_GROUPS

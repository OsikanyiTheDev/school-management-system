"""ID helpers for tenant-owned SMIS records."""

from __future__ import annotations

import re
import uuid

SLUG_RE = re.compile(r"[^a-z0-9]+")


def slugify(value: str, *, fallback: str = "item", max_length: int = 36) -> str:
    slug = SLUG_RE.sub("-", value.strip().lower()).strip("-")
    slug = re.sub(r"-+", "-", slug)
    if not slug:
        slug = fallback
    return slug[:max_length].strip("-") or fallback


def new_entity_id(prefix: str) -> str:
    """Return an ID matching the ENTITY_ID_RE pattern in tenant.py."""
    if not re.fullmatch(r"[a-z]{2,16}", prefix):
        raise ValueError("prefix must be 2 to 16 lowercase letters")
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def new_school_id(name: str, code: str | None = None) -> str:
    base = slugify(code or name, fallback="school", max_length=32).replace("-", "_")
    return f"sch_{base}_{uuid.uuid4().hex[:6]}"

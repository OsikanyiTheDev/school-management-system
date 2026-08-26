"""POST /schools — create a school tenant (PlatformAdmin)."""

from __future__ import annotations

import os

from shared import authz, http
from shared.domain import build_school
from shared.repository import RepositoryConflict, SmisRepository
from shared.validation import validate_school


def public_school(item: dict) -> dict:
    return {key: item.get(key) for key in ("school_id", "name", "code", "email", "phone", "address", "status", "created_at", "updated_at") if key in item}


def lambda_handler(event, context):  # noqa: ARG001
    if not authz.is_platform_admin(event):
        return http.forbidden("platform_admin_required")
    sub = authz.caller_sub(event) or "unknown"
    try:
        payload = http.parse_json_body(event)
    except ValueError as exc:
        return http.bad_request([str(exc)])
    clean, errors = validate_school(payload)
    if errors:
        return http.bad_request(errors)
    repo = SmisRepository(os.environ.get("TABLE_NAME", "smis-dev-app"))
    item = build_school(clean, created_by=sub)
    try:
        repo.put_item(item)
    except RepositoryConflict:
        return http.bad_request(["school already exists"])
    return http.created({"school": public_school(item)})

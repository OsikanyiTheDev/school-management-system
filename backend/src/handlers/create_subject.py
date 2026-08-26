"""POST /schools/{school_id}/subjects."""

from __future__ import annotations

import os

from shared import authz, http
from shared.domain import build_subject
from shared.repository import RepositoryConflict, SmisRepository
from shared.validation import validate_subject


def public_item(item: dict) -> dict:
    return {key: value for key, value in item.items() if key not in {"PK", "SK", "GSI1PK", "GSI1SK", "GSI2PK", "GSI2SK", "GSI3PK", "GSI3SK"}}


def lambda_handler(event, context):  # noqa: ARG001
    school_id = http.path_parameter(event, "school_id")
    if not school_id:
        return http.bad_request(["missing school_id"])
    repo = SmisRepository(os.environ.get("TABLE_NAME", "smis-dev-app"))
    if not authz.can_manage_school(event, school_id, repo):
        return http.forbidden("school_admin_required")
    try:
        payload = http.parse_json_body(event)
    except ValueError as exc:
        return http.bad_request([str(exc)])
    payload["school_id"] = school_id
    clean, errors = validate_subject(payload)
    if errors:
        return http.bad_request(errors)
    item = build_subject(clean, created_by=authz.caller_sub(event) or "unknown")
    try:
        repo.put_item(item)
    except RepositoryConflict:
        return http.bad_request(["subject already exists"])
    return http.created({"subject": public_item(item)})

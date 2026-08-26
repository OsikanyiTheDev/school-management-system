"""GET /schools/{school_id} — get school profile."""

from __future__ import annotations

import os

from shared import authz, http
from shared.repository import SmisRepository


def public_school(item: dict) -> dict:
    return {key: item.get(key) for key in ("school_id", "name", "code", "email", "phone", "address", "status", "created_at", "updated_at") if key in item}


def lambda_handler(event, context):  # noqa: ARG001
    school_id = http.path_parameter(event, "school_id")
    if not school_id:
        return http.bad_request(["missing school_id"])
    repo = SmisRepository(os.environ.get("TABLE_NAME", "smis-dev-app"))
    if not authz.can_access_school(event, school_id, repo):
        return http.forbidden("school_access_required")
    item = repo.get_school(school_id)
    if not item:
        return http.not_found("school_not_found")
    return http.ok({"school": public_school(item)})

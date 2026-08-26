"""Small API Gateway HTTP helpers for Lambda handlers."""

from __future__ import annotations

import json
from typing import Any

DEFAULT_HEADERS = {
    "content-type": "application/json",
    "cache-control": "no-store",
}


def response(status_code: int, body: dict[str, Any]) -> dict[str, Any]:
    return {
        "statusCode": status_code,
        "headers": DEFAULT_HEADERS,
        "body": json.dumps(body, separators=(",", ":")),
    }


def ok(body: dict[str, Any]) -> dict[str, Any]:
    return response(200, body)


def created(body: dict[str, Any]) -> dict[str, Any]:
    return response(201, body)


def bad_request(errors: list[str]) -> dict[str, Any]:
    return response(400, {"error": "bad_request", "details": errors})


def forbidden(message: str = "forbidden") -> dict[str, Any]:
    return response(403, {"error": message})


def not_found(message: str = "not_found") -> dict[str, Any]:
    return response(404, {"error": message})


def parse_json_body(event: dict[str, Any]) -> dict[str, Any]:
    raw = event.get("body")
    if raw in (None, ""):
        return {}
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError("request body must be valid JSON") from exc
    if not isinstance(parsed, dict):
        raise ValueError("request body must be a JSON object")
    return parsed

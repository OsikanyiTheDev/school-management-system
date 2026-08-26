"""GET /health handler."""

from __future__ import annotations

import os
import platform
import time

from shared import http


def lambda_handler(event, context):  # noqa: ARG001 - AWS Lambda signature
    return http.ok(
        {
            "status": "ok",
            "service": "smis-api",
            "environment": os.environ.get("ENVIRONMENT", "dev"),
            "python": platform.python_version(),
            "epoch": int(time.time()),
        }
    )

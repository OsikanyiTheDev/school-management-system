"""DynamoDB repository abstraction for the SMIS single-table model."""

from __future__ import annotations

import datetime as dt
from typing import Any


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()


class RepositoryConflict(Exception):
    """Raised when a conditional write would overwrite an existing item."""


class SmisRepository:
    def __init__(self, table_name: str, table: Any = None):
        self.table_name = table_name
        if table is None:
            import boto3

            self._table = boto3.resource("dynamodb").Table(table_name)
        else:
            self._table = table

    def put_item(self, item: dict[str, Any], *, overwrite: bool = False) -> dict[str, Any]:
        kwargs: dict[str, Any] = {"Item": item}
        if not overwrite:
            kwargs["ConditionExpression"] = "attribute_not_exists(PK) AND attribute_not_exists(SK)"
        try:
            self._table.put_item(**kwargs)
        except Exception as exc:  # boto3 ClientError without importing boto3 in tests
            code = getattr(exc, "response", {}).get("Error", {}).get("Code")
            if code == "ConditionalCheckFailedException":
                raise RepositoryConflict("item already exists") from exc
            raise
        return item

    def get_item(self, pk: str, sk: str) -> dict[str, Any] | None:
        result = self._table.get_item(Key={"PK": pk, "SK": sk})
        return result.get("Item")

    def query_pk(self, pk: str, *, limit: int = 50) -> list[dict[str, Any]]:
        result = self._table.query(
            KeyConditionExpression="PK = :pk",
            ExpressionAttributeValues={":pk": pk},
            Limit=limit,
        )
        return result.get("Items", [])

    def get_school(self, school_id: str) -> dict[str, Any] | None:
        return self.get_item(f"SCHOOL#{school_id}", "PROFILE")

    def get_membership(self, user_sub: str, school_id: str) -> dict[str, Any] | None:
        return self.get_item(f"USER#{user_sub}", f"SCHOOL#{school_id}")

"""DynamoDB item builders for Phase 1 SMIS entities."""

from __future__ import annotations

from typing import Any

from .ids import new_entity_id, new_school_id
from .repository import now_iso
from .tenant import tenant_pk, entity_sk


def base_item(*, pk: str, sk: str, school_id: str | None, entity_type: str, entity_id: str) -> dict[str, Any]:
    timestamp = now_iso()
    item: dict[str, Any] = {
        "PK": pk,
        "SK": sk,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "created_at": timestamp,
        "updated_at": timestamp,
    }
    if school_id is not None:
        item["school_id"] = school_id
    return item


def build_school(clean: dict[str, Any], *, created_by: str) -> dict[str, Any]:
    school_id = clean.get("school_id") or new_school_id(clean["name"], clean.get("code"))
    item = base_item(
        pk=f"SCHOOL#{school_id}",
        sk="PROFILE",
        school_id=school_id,
        entity_type="school",
        entity_id=school_id,
    )
    item.update(
        {
            "school_id": school_id,
            "name": clean["name"],
            "code": clean["code"],
            "email": clean.get("email"),
            "phone": clean.get("phone"),
            "address": clean.get("address"),
            "status": "active",
            "created_by": created_by,
            "GSI1PK": "SCHOOL",
            "GSI1SK": clean["name"].lower(),
        }
    )
    return {key: value for key, value in item.items() if value is not None}


def build_academic_year(clean: dict[str, Any], *, created_by: str) -> dict[str, Any]:
    school_id = clean["school_id"]
    academic_year_id = clean.get("academic_year_id") or new_entity_id("ayr")
    item = base_item(
        pk=tenant_pk(school_id, "academic_year"),
        sk=entity_sk(academic_year_id),
        school_id=school_id,
        entity_type="academic_year",
        entity_id=academic_year_id,
    )
    item.update(
        {
            "academic_year_id": academic_year_id,
            "label": clean["label"],
            "status": clean.get("status", "planned"),
            "created_by": created_by,
            "GSI1PK": f"SCHOOL#{school_id}#ACADEMIC_YEAR",
            "GSI1SK": clean["label"],
            "GSI3PK": f"SCHOOL#{school_id}#ACADEMIC_SETUP",
            "GSI3SK": f"ACADEMIC_YEAR#{clean['label']}",
        }
    )
    return item


def build_term(clean: dict[str, Any], *, created_by: str) -> dict[str, Any]:
    school_id = clean["school_id"]
    term_id = clean.get("term_id") or new_entity_id("term")
    item = base_item(
        pk=tenant_pk(school_id, "term"),
        sk=entity_sk(term_id),
        school_id=school_id,
        entity_type="term",
        entity_id=term_id,
    )
    item.update(
        {
            "term_id": term_id,
            "academic_year_id": clean["academic_year_id"],
            "name": clean["name"],
            "status": clean.get("status", "planned"),
            "starts_on": clean.get("starts_on"),
            "ends_on": clean.get("ends_on"),
            "created_by": created_by,
            "GSI1PK": f"SCHOOL#{school_id}#TERM",
            "GSI1SK": f"{clean['academic_year_id']}#{clean['name'].lower()}",
            "GSI3PK": f"SCHOOL#{school_id}#ACADEMIC_SETUP",
            "GSI3SK": f"TERM#{clean['academic_year_id']}#{clean['name'].lower()}",
        }
    )
    return {key: value for key, value in item.items() if value is not None}


def build_class(clean: dict[str, Any], *, created_by: str) -> dict[str, Any]:
    school_id = clean["school_id"]
    class_id = clean.get("class_id") or new_entity_id("cls")
    item = base_item(
        pk=tenant_pk(school_id, "class"),
        sk=entity_sk(class_id),
        school_id=school_id,
        entity_type="class",
        entity_id=class_id,
    )
    item.update(
        {
            "class_id": class_id,
            "academic_year_id": clean["academic_year_id"],
            "name": clean["name"],
            "level": clean.get("level"),
            "status": clean.get("status", "active"),
            "created_by": created_by,
            "GSI1PK": f"SCHOOL#{school_id}#CLASS",
            "GSI1SK": f"{clean['academic_year_id']}#{clean['name'].lower()}",
        }
    )
    return {key: value for key, value in item.items() if value is not None}


def build_subject(clean: dict[str, Any], *, created_by: str) -> dict[str, Any]:
    school_id = clean["school_id"]
    subject_id = clean.get("subject_id") or new_entity_id("subj")
    item = base_item(
        pk=tenant_pk(school_id, "subject"),
        sk=entity_sk(subject_id),
        school_id=school_id,
        entity_type="subject",
        entity_id=subject_id,
    )
    item.update(
        {
            "subject_id": subject_id,
            "name": clean["name"],
            "code": clean.get("code"),
            "department": clean.get("department"),
            "status": clean.get("status", "active"),
            "created_by": created_by,
            "GSI1PK": f"SCHOOL#{school_id}#SUBJECT",
            "GSI1SK": clean["name"].lower(),
        }
    )
    return {key: value for key, value in item.items() if value is not None}


def build_person(clean: dict[str, Any], *, person_type: str, id_prefix: str, created_by: str) -> dict[str, Any]:
    school_id = clean["school_id"]
    person_id = clean.get(f"{person_type}_id") or new_entity_id(id_prefix)
    item = base_item(
        pk=tenant_pk(school_id, person_type),
        sk=entity_sk(person_id),
        school_id=school_id,
        entity_type=person_type,
        entity_id=person_id,
    )
    name_sort = f"{clean.get('last_name', '').lower()}#{clean.get('first_name', '').lower()}#{person_id}"
    item.update(
        {
            f"{person_type}_id": person_id,
            "first_name": clean["first_name"],
            "last_name": clean["last_name"],
            "email": clean.get("email"),
            "phone": clean.get("phone"),
            "address": clean.get("address"),
            "status": clean.get("status", "active"),
            "created_by": created_by,
            "GSI1PK": f"SCHOOL#{school_id}#{person_type.upper()}",
            "GSI1SK": name_sort,
        }
    )
    if person_type == "student":
        item.update(
            {
                "class_id": clean["class_id"],
                "academic_year_id": clean.get("academic_year_id"),
                "date_of_birth": clean.get("date_of_birth"),
                "gender": clean["gender"],
                "enrollment_date": clean.get("enrollment_date"),
                "guardian_ids": clean.get("guardian_ids", []),
            }
        )
    if person_type == "teacher":
        item.update(
            {
                "teacher_number": clean.get("teacher_number"),
                "department": clean.get("department"),
                "hire_date": clean.get("hire_date"),
            }
        )
    if person_type == "guardian":
        item.update(
            {
                "relationship": clean.get("relationship"),
                "student_ids": clean.get("student_ids", []),
            }
        )
    return {key: value for key, value in item.items() if value is not None}

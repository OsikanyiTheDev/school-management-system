"""Domain validation for Phase 1 setup entities."""

from __future__ import annotations

import re
from typing import Any

from .tenant import is_valid_school_id

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^\+?[0-9]{9,15}$")
ACADEMIC_YEAR_RE = re.compile(r"^20\d{2}/20\d{2}$")

GENDERS = {"female", "male", "other", "prefer_not_to_say"}
STUDENT_STATUSES = {"active", "transferred", "graduated", "suspended", "withdrawn"}
TERM_STATUSES = {"planned", "active", "closed"}


def _text(value: Any, field: str, errors: list[str], *, required: bool = True, min_len: int = 1, max_len: int = 120) -> str | None:
    if value in (None, ""):
        if required:
            errors.append(f"{field} is required")
        return None
    if not isinstance(value, str):
        errors.append(f"{field} must be text")
        return None
    cleaned = value.strip()
    if not (min_len <= len(cleaned) <= max_len):
        errors.append(f"{field} must be between {min_len} and {max_len} characters")
        return None
    return cleaned


def _choice(value: Any, field: str, allowed: set[str], errors: list[str], *, required: bool = True) -> str | None:
    if value in (None, ""):
        if required:
            errors.append(f"{field} is required")
        return None
    if value not in allowed:
        errors.append(f"{field} must be one of: {', '.join(sorted(allowed))}")
        return None
    return str(value)


def _email(value: Any, field: str, errors: list[str], *, required: bool = False) -> str | None:
    email = _text(value, field, errors, required=required, min_len=5, max_len=254)
    if email is None:
        return None
    if not EMAIL_RE.fullmatch(email):
        errors.append(f"{field} must be a valid email address")
        return None
    return email.lower()


def _phone(value: Any, field: str, errors: list[str], *, required: bool = False) -> str | None:
    phone = _text(value, field, errors, required=required, min_len=9, max_len=16)
    if phone is None:
        return None
    if not PHONE_RE.fullmatch(phone):
        errors.append(f"{field} must be a valid phone number")
        return None
    return phone


def validate_school(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    errors: list[str] = []
    clean: dict[str, Any] = {}

    name = _text(payload.get("name"), "name", errors, min_len=2, max_len=160)
    if name:
        clean["name"] = name
    code = _text(payload.get("code"), "code", errors, min_len=2, max_len=24)
    if code:
        clean["code"] = code.upper().replace(" ", "-")
    email = _email(payload.get("email"), "email", errors)
    if email:
        clean["email"] = email
    phone = _phone(payload.get("phone"), "phone", errors)
    if phone:
        clean["phone"] = phone
    address = _text(payload.get("address"), "address", errors, required=False, min_len=0, max_len=300)
    if address is not None:
        clean["address"] = address

    return clean, errors


def validate_academic_year(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    errors: list[str] = []
    clean: dict[str, Any] = {}
    school_id = _text(payload.get("school_id"), "school_id", errors, min_len=5, max_len=64)
    if school_id and not is_valid_school_id(school_id):
        errors.append("school_id must look like sch_example")
    elif school_id:
        clean["school_id"] = school_id

    label = _text(payload.get("label"), "label", errors, min_len=9, max_len=9)
    if label and not ACADEMIC_YEAR_RE.fullmatch(label):
        errors.append("label must look like 2026/2027")
    elif label:
        start, end = label.split("/")
        if int(end) != int(start) + 1:
            errors.append("academic year end must be the next calendar year")
        else:
            clean["label"] = label
    return clean, errors


def validate_class(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    errors: list[str] = []
    clean: dict[str, Any] = {}
    for field in ("school_id", "academic_year_id"):
        value = _text(payload.get(field), field, errors, min_len=5, max_len=80)
        if value:
            clean[field] = value
    name = _text(payload.get("name"), "name", errors, min_len=1, max_len=80)
    if name:
        clean["name"] = name
    level = _text(payload.get("level"), "level", errors, required=False, min_len=0, max_len=50)
    if level is not None:
        clean["level"] = level
    return clean, errors


def validate_student_profile(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    errors: list[str] = []
    clean: dict[str, Any] = {}
    for field in ("school_id", "class_id"):
        value = _text(payload.get(field), field, errors, min_len=5, max_len=80)
        if value:
            clean[field] = value
    for field in ("first_name", "last_name"):
        value = _text(payload.get(field), field, errors, min_len=1, max_len=80)
        if value:
            clean[field] = value
    gender = _choice(payload.get("gender"), "gender", GENDERS, errors)
    if gender:
        clean["gender"] = gender
    status = _choice(payload.get("status", "active"), "status", STUDENT_STATUSES, errors)
    if status:
        clean["status"] = status
    email = _email(payload.get("email"), "email", errors)
    if email:
        clean["email"] = email
    phone = _phone(payload.get("phone"), "phone", errors)
    if phone:
        clean["phone"] = phone
    for field in ("academic_year_id", "date_of_birth", "enrollment_date", "address"):
        value = _text(payload.get(field), field, errors, required=False, min_len=0, max_len=160)
        if value is not None:
            clean[field] = value
    guardian_ids = payload.get("guardian_ids", [])
    if not isinstance(guardian_ids, list) or not all(isinstance(item, str) for item in guardian_ids):
        errors.append("guardian_ids must be a list of guardian IDs")
    else:
        clean["guardian_ids"] = list(dict.fromkeys(guardian_ids))
    return clean, errors

def validate_term(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    errors: list[str] = []
    clean: dict[str, Any] = {}
    for field in ("school_id", "academic_year_id"):
        value = _text(payload.get(field), field, errors, min_len=5, max_len=80)
        if value:
            clean[field] = value
    name = _text(payload.get("name"), "name", errors, min_len=2, max_len=80)
    if name:
        clean["name"] = name
    status = _choice(payload.get("status", "planned"), "status", TERM_STATUSES, errors)
    if status:
        clean["status"] = status
    for field in ("starts_on", "ends_on"):
        value = _text(payload.get(field), field, errors, required=False, min_len=0, max_len=32)
        if value is not None:
            clean[field] = value
    return clean, errors


def validate_subject(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    errors: list[str] = []
    clean: dict[str, Any] = {}
    school_id = _text(payload.get("school_id"), "school_id", errors, min_len=5, max_len=64)
    if school_id:
        clean["school_id"] = school_id
    name = _text(payload.get("name"), "name", errors, min_len=2, max_len=100)
    if name:
        clean["name"] = name
    code = _text(payload.get("code"), "code", errors, required=False, min_len=0, max_len=24)
    if code is not None:
        clean["code"] = code.upper().replace(" ", "-")
    department = _text(payload.get("department"), "department", errors, required=False, min_len=0, max_len=80)
    if department is not None:
        clean["department"] = department
    return clean, errors


def validate_teacher_profile(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    errors: list[str] = []
    clean: dict[str, Any] = {}
    school_id = _text(payload.get("school_id"), "school_id", errors, min_len=5, max_len=64)
    if school_id:
        clean["school_id"] = school_id
    for field in ("first_name", "last_name"):
        value = _text(payload.get(field), field, errors, min_len=1, max_len=80)
        if value:
            clean[field] = value
    for field in ("teacher_number", "department", "hire_date", "address"):
        value = _text(payload.get(field), field, errors, required=False, min_len=0, max_len=160)
        if value is not None:
            clean[field] = value
    email = _email(payload.get("email"), "email", errors)
    if email:
        clean["email"] = email
    phone = _phone(payload.get("phone"), "phone", errors)
    if phone:
        clean["phone"] = phone
    clean["status"] = "active"
    return clean, errors


def validate_guardian_profile(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    errors: list[str] = []
    clean: dict[str, Any] = {}
    school_id = _text(payload.get("school_id"), "school_id", errors, min_len=5, max_len=64)
    if school_id:
        clean["school_id"] = school_id
    for field in ("first_name", "last_name"):
        value = _text(payload.get(field), field, errors, min_len=1, max_len=80)
        if value:
            clean[field] = value
    relationship = _text(payload.get("relationship"), "relationship", errors, required=False, min_len=0, max_len=80)
    if relationship is not None:
        clean["relationship"] = relationship
    address = _text(payload.get("address"), "address", errors, required=False, min_len=0, max_len=200)
    if address is not None:
        clean["address"] = address
    email = _email(payload.get("email"), "email", errors)
    if email:
        clean["email"] = email
    phone = _phone(payload.get("phone"), "phone", errors, required=True)
    if phone:
        clean["phone"] = phone
    student_ids = payload.get("student_ids", [])
    if not isinstance(student_ids, list) or not all(isinstance(item, str) for item in student_ids):
        errors.append("student_ids must be a list of student IDs")
    else:
        clean["student_ids"] = list(dict.fromkeys(student_ids))
    clean["status"] = "active"
    return clean, errors


def validate_teacher_assignment(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    errors: list[str] = []
    clean: dict[str, Any] = {}
    for field in ("school_id", "academic_year_id", "term_id", "class_id", "subject_id", "teacher_id"):
        value = _text(payload.get(field), field, errors, min_len=5, max_len=80)
        if value:
            clean[field] = value
    status = _choice(payload.get("status", "active"), "status", {"active", "inactive"}, errors)
    if status:
        clean["status"] = status
    note = _text(payload.get("note"), "note", errors, required=False, min_len=0, max_len=300)
    if note is not None:
        clean["note"] = note
    return clean, errors

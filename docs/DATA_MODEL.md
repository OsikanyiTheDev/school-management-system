# SMIS Data Model

## Multi-tenant rule

Every school-owned item must include:

```json
{
  "school_id": "sch_example",
  "entity_type": "student"
}
```

Application authorization must check both:

1. User role permissions.
2. User membership in the requested `school_id`.

## Foundational entities

### School

```text
school_id
name
code
email
phone
address
status
created_at
updated_at
```

### User membership

Connects a Cognito user to a school and role.

```text
user_sub
school_id
role: PlatformAdmin | SchoolAdmin | Teacher | Student | ParentGuardian | FinanceOfficer
person_id: optional link to teacher/student/guardian profile
status
created_at
updated_at
```

### Academic year

```text
academic_year_id
school_id
label: 2026/2027
starts_on
ends_on
status
```

### Term

```text
term_id
school_id
academic_year_id
name: Term 1
starts_on
ends_on
status: planned | active | closed
```

### Class

```text
class_id
school_id
academic_year_id
name: JHS 2A
level
class_teacher_id
status
```

### Subject

```text
subject_id
school_id
name
code
department
status
```

### Teacher assignment

```text
assignment_id
school_id
academic_year_id
term_id
class_id
subject_id
teacher_id
status
```

### Student

```text
student_id
school_id
class_id
academic_year_id
first_name
last_name
date_of_birth
gender
photo_key
phone
email
address
enrollment_date
status
```

### Parent/guardian

```text
guardian_id
school_id
first_name
last_name
phone
email
address
relationship_links[]
```

Do not embed all child records inside the parent object. Use relationship items to link guardians to students.

## Future entities

### Attendance

Tenant and class/date scoped.

```text
attendance_id
school_id
class_id
student_id
date
status: present | absent | late | excused
marked_by
```

### Teacher attendance

```text
teacher_attendance_id
school_id
teacher_id
date
check_in_at
check_out_at
status
```

### Assessment and exam scores

```text
score_id
school_id
academic_year_id
term_id
class_id
subject_id
student_id
assessment_type
score
max_score
weight
teacher_remark
```

### Finance

```text
fee_structure → invoice → payment → receipt
```

Invoices and payments must maintain history. Do not use a single `paid = true` flag.

## DynamoDB item key examples

```text
PK = SCHOOL#sch_acme#STUDENT
SK = ID#stu_001

PK = SCHOOL#sch_acme#CLASS
SK = ID#cls_jhs2a

PK = USER#cognito-sub
SK = SCHOOL#sch_acme
```

The key helpers in `backend/src/shared/tenant.py` enforce early naming discipline.

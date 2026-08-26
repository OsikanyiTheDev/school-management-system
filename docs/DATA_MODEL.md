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

## Current Phase 1 entities

### School

```text
PK = SCHOOL#{school_id}
SK = PROFILE

school_id
name
code
email
phone
address
status
created_by
created_at
updated_at
```

### Academic year

```text
PK = SCHOOL#{school_id}#ACADEMIC_YEAR
SK = ID#{academic_year_id}

academic_year_id
school_id
label: 2026/2027
status
created_by
created_at
updated_at
```

### Term

```text
PK = SCHOOL#{school_id}#TERM
SK = ID#{term_id}

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
PK = SCHOOL#{school_id}#CLASS
SK = ID#{class_id}

class_id
school_id
academic_year_id
name: JHS 2A
level
class_teacher_id: future
status
```

### Subject

```text
PK = SCHOOL#{school_id}#SUBJECT
SK = ID#{subject_id}

subject_id
school_id
name
code
department
status
```

### Student

```text
PK = SCHOOL#{school_id}#STUDENT
SK = ID#{student_id}

student_id
school_id
class_id
academic_year_id
first_name
last_name
date_of_birth
gender
photo_key: future
phone
email
address
enrollment_date
status
guardian_ids[]
```

### Teacher

```text
PK = SCHOOL#{school_id}#TEACHER
SK = ID#{teacher_id}

teacher_id
school_id
first_name
last_name
teacher_number
department
hire_date
phone
email
address
status
```

### Parent/guardian

```text
PK = SCHOOL#{school_id}#GUARDIAN
SK = ID#{guardian_id}

guardian_id
school_id
first_name
last_name
relationship
phone
email
address
student_ids[]
status
```

Do not embed all child records inside the parent object. Use relationship fields/items to link guardians to students, and later promote those links to dedicated relationship records if access patterns require it.

## User membership

Connects a Cognito user to a school and role. This item shape is planned for the next auth increment:

```text
PK = USER#{cognito_sub}
SK = SCHOOL#{school_id}

user_sub
school_id
role: PlatformAdmin | SchoolAdmin | Teacher | Student | ParentGuardian | FinanceOfficer
person_id: optional link to teacher/student/guardian profile
status
created_at
updated_at
```

## Future entities

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

### Attendance

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

# SMIS API Design

## Implemented Phase 1 foundation endpoints

All implemented setup endpoints are designed for API Gateway + Cognito JWT authorization. Terraform wires the authorizer. Handlers also check role and tenant ownership from token claims and/or membership records.

| Method | Route | Auth | Handler | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/health` | Public | `health` | Service health check |
| POST | `/schools` | PlatformAdmin | `create_school` | Create a school tenant |
| GET | `/schools/{school_id}` | School member / PlatformAdmin | `get_school` | Get a school profile |
| POST | `/schools/{school_id}/academic-years` | SchoolAdmin / PlatformAdmin | `create_academic_year` | Create an academic year |
| POST | `/schools/{school_id}/terms` | SchoolAdmin / PlatformAdmin | `create_term` | Create a term |
| POST | `/schools/{school_id}/classes` | SchoolAdmin / PlatformAdmin | `create_class` | Create a class |
| POST | `/schools/{school_id}/subjects` | SchoolAdmin / PlatformAdmin | `create_subject` | Create a subject |
| POST | `/schools/{school_id}/students` | SchoolAdmin / PlatformAdmin | `create_student` | Create a student profile |
| POST | `/schools/{school_id}/teachers` | SchoolAdmin / PlatformAdmin | `create_teacher` | Create a teacher profile |
| POST | `/schools/{school_id}/guardians` | SchoolAdmin / PlatformAdmin | `create_guardian` | Create a parent/guardian profile |

## Example payloads

### Create school

```json
{
  "name": "Accra Model School",
  "code": "AMS",
  "email": "admin@example.edu",
  "phone": "+233241234567",
  "address": "Accra, Ghana"
}
```

### Create academic year

```json
{
  "label": "2026/2027"
}
```

### Create term

```json
{
  "academic_year_id": "ayr_abc123",
  "name": "Term 1",
  "starts_on": "2026-09-01",
  "ends_on": "2026-12-18"
}
```

### Create class

```json
{
  "academic_year_id": "ayr_abc123",
  "name": "JHS 2A",
  "level": "JHS 2"
}
```

### Create subject

```json
{
  "name": "Mathematics",
  "code": "MATH",
  "department": "Core"
}
```

### Create student

```json
{
  "class_id": "cls_abc123",
  "academic_year_id": "ayr_abc123",
  "first_name": "Ama",
  "last_name": "Mensah",
  "gender": "female",
  "email": "ama@example.edu",
  "guardian_ids": ["gdn_abc123"]
}
```

### Create teacher

```json
{
  "first_name": "Kofi",
  "last_name": "Owusu",
  "teacher_number": "T-001",
  "department": "Science",
  "email": "kofi@example.edu"
}
```

### Create guardian

```json
{
  "first_name": "Esi",
  "last_name": "Mensah",
  "relationship": "Mother",
  "phone": "+233241234567",
  "email": "esi@example.com",
  "student_ids": ["stu_abc123"]
}
```

## API principles

- All school-owned routes include `school_id`.
- JWT-protected routes must verify Cognito token claims.
- Backend authorization checks school membership/tenant access, not only route shape.
- School-owned data is always written with tenant-scoped DynamoDB keys.
- Public APIs should remain minimal.
- Responses should be explicit and avoid leaking internal DynamoDB keys.


## Frontend backend-for-frontend proxy

The frontend includes a strict allowlisted proxy at:

```text
/api/backend/[...path]
```

It reads Cognito tokens from HTTP-only cookies and forwards a verified Cognito JWT only for approved routes to API Gateway. Browser JavaScript never reads the token directly. The proxy currently prefers the ID token so Lambda receives the same role/group claims displayed in `/api/auth/session`.

Currently allowed through the proxy:

```text
POST /api/backend/schools
GET  /api/backend/schools/{school_id}
POST /api/backend/schools/{school_id}/academic-years
POST /api/backend/schools/{school_id}/terms
POST /api/backend/schools/{school_id}/classes
POST /api/backend/schools/{school_id}/subjects
POST /api/backend/schools/{school_id}/students
POST /api/backend/schools/{school_id}/teachers
POST /api/backend/schools/{school_id}/guardians
```


## Academic setup UI flow

The PlatformAdmin flow now links a created school tenant to:

```text
/platform/schools/{school_id}/setup
```

That page creates:

1. Academic year
2. Term
3. Class
4. Subject

The page displays generated IDs so later people, attendance, grading and finance flows can connect to the correct tenant records.

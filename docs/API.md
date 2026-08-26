# SMIS API Design

## Current foundation endpoint

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | Service health check |

## Planned Phase 1 endpoints

### School setup

| Method | Route | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/schools` | PlatformAdmin | Create a school tenant |
| GET | `/schools/{school_id}` | School member | Get school profile |
| PATCH | `/schools/{school_id}` | SchoolAdmin | Update school settings |

### Academic setup

| Method | Route | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/schools/{school_id}/academic-years` | SchoolAdmin | Create academic year |
| POST | `/schools/{school_id}/terms` | SchoolAdmin | Create term |
| POST | `/schools/{school_id}/classes` | SchoolAdmin | Create class |
| POST | `/schools/{school_id}/subjects` | SchoolAdmin | Create subject |
| POST | `/schools/{school_id}/teacher-assignments` | SchoolAdmin | Assign teacher to class/subject |

### People

| Method | Route | Role | Purpose |
| --- | --- | --- | --- |
| POST | `/schools/{school_id}/students` | SchoolAdmin | Create student profile |
| POST | `/schools/{school_id}/teachers` | SchoolAdmin | Create teacher profile |
| POST | `/schools/{school_id}/guardians` | SchoolAdmin | Create guardian profile |
| POST | `/schools/{school_id}/memberships` | SchoolAdmin | Link Cognito user to school role |

## API principles

- All school-owned routes include `school_id`.
- JWT-protected routes must verify Cognito token claims.
- Backend authorization must check school membership, not only role names.
- Public APIs should be minimal.
- Responses should be explicit and avoid leaking cross-tenant data.

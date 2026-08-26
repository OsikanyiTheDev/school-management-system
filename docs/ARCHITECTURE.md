# SMIS Architecture

## Goal

Build a production-oriented School Management Information System that starts with one school but is designed to become a multi-school SaaS platform.

The core principle is **tenant-first design**: every school-owned record must be scoped to a `school_id`, and every API request that touches school data must enforce tenant ownership and role authorization.

## High-level system

```text
Browser
  ↓
Next.js frontend on Vercel
  ↓
API Gateway HTTP API
  ↓
Lambda handlers
  ↓
DynamoDB single-table data store
  ↓
S3 private document/media bucket
  ↓
Cognito user pool and groups
  ↓
CloudWatch logs/metrics
```

## Deployment split

Frontend deployment and AWS deployment are intentionally separate.

```text
GitHub → Vercel → Frontend
GitHub → Local clone → Terraform plan/apply → AWS
```

GitHub Actions can validate Terraform, but it must not apply infrastructure in the early phases.

## Frontend approach

The frontend is a Next.js TypeScript application at the repository root under `src/`. It will evolve into a role-aware dashboard with:

- School administrator navigation
- Teacher workspace
- Student self-service
- Parent/guardian portal
- Finance officer workspace

The Phase 1 UI is a foundation shell and architecture/product overview. Functional pages will be added module by module.

## Backend approach

The backend is under `backend/` and is designed for AWS Lambda. Shared libraries handle:

- API Gateway responses
- Tenant key construction
- Validation
- Future authorization helpers
- Repository helpers

Phase 1 starts with a health endpoint and tested domain helpers. APIs will be added incrementally.

## Infrastructure approach

Terraform lives under `infrastructure/terraform`.

Initial modules:

- `data_store`: DynamoDB PAY_PER_REQUEST single-table design with tenant/reporting indexes
- `auth`: Cognito user pool, app client and role groups
- `media_storage`: private S3 document/media bucket
- `api`: API Gateway HTTP API, Lambda package, IAM and CloudWatch logs

## Why DynamoDB single-table design?

The system has many related entities, but most application access patterns are tenant-scoped:

- List students in a school/class
- List teachers in a school
- List subjects/classes in a school and academic year
- Query attendance by class/date
- Query invoices and payments by student/term
- Query a user's school memberships

A single table keeps the serverless operating model simple while supporting tenant isolation through partition key design.

## Initial DynamoDB indexes

```text
Primary key:
PK      tenant/entity partition
SK      entity-specific sort key

GSI1 tenant-entity-index:
GSI1PK  school + entity collection
GSI1SK  sortable lookup value

GSI2 user-membership-index:
GSI2PK  user identity
GSI2SK  school membership / role

GSI3 reporting-index:
GSI3PK  tenant report bucket
GSI3SK  date/term/status metric key
```

These names may be refined as concrete access patterns are implemented, but the foundational table supports tenant-first querying.

## Future services

Add only when justified:

- SES for email notifications and receipts
- EventBridge for scheduled term/report jobs
- SQS for asynchronous bulk processing
- SSM/Secrets Manager for server-side secrets if integrations require them

Do not add services just to make the architecture look bigger.

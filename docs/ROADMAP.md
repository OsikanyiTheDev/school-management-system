# Implementation Roadmap

## Phase 1 — Foundation

Completed so far:

- Repository structure
- Next.js dashboard shell at repository root for Vercel
- Lambda backend foundation
- Validation, ID, repository, tenant and authorization helpers
- Terraform module foundation
- API Gateway routes for school setup and people records
- PlatformAdmin school creation UI
- Academic setup UI for academic years, terms, classes and subjects
- People management UI for teachers, guardians and students
- CI workflow
- Architecture, security, API and data-model docs

Next Phase 1 increments:

1. Cognito login flow in frontend.
2. JWT verification/session handling in the frontend backend-for-frontend layer.
3. Membership management API for linking users to schools and roles.
4. Teacher assignment API.
5. List/get/update endpoints for school setup and people records.
6. Role-aware dashboard route structure.

## Phase 2 — Academics

- Teacher assignments
- Student attendance
- Teacher attendance
- Configurable grading rules
- Continuous assessment
- Examination setup
- Result publication rules

## Phase 3 — Finance

- Fee structures
- Invoice generation
- Payment recording
- Receipt IDs
- Balances and payment history
- Finance reports

## Phase 4 — Dashboards

- Admin dashboard
- Teacher dashboard
- Parent dashboard
- Student dashboard
- Finance dashboard

## Phase 5 — Production features

- SES notifications
- EventBridge scheduled jobs
- S3 document upload/download flows
- Audit logs
- Report-card generation
- CSV/PDF exports

## Phase 6 — SaaS

- School onboarding
- Platform admin area
- Tenant lifecycle
- Subscription architecture
- Stronger isolation and monitoring controls

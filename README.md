# School Management Information System — SMIS

A production-oriented, cloud-based School Management Information System designed to evolve into a multi-school SaaS platform.

The system is being built to manage school setup, students, parents/guardians, teachers, classes, subjects, attendance, grades, examinations, fees, invoices, payments, receipts, dashboards, notifications, reports and documents.

> **Status:** Phase 1 foundation is in progress. The repository is intentionally structured for real SaaS evolution, not as a single-school CRUD demo.

## Architecture

```text
Frontend Next.js app
   │
   ▼
Vercel
   │
   ▼
Amazon API Gateway HTTP API
   │
   ▼
AWS Lambda
   │
   ├── DynamoDB  single-table multi-tenant application data
   ├── S3        private documents and future media storage
   ├── Cognito   authentication and role groups
   ├── CloudWatch logs and metrics
   └── future: SES, EventBridge, SQS where justified
```

AWS infrastructure is managed with Terraform, but Terraform is **not** applied from CI. The operator runs Terraform locally with their own AWS credentials.

## Technology stack

### Frontend

- Next.js App Router
- TypeScript
- Responsive dashboard UI
- Role-based navigation model
- Vercel deployment through GitHub

### Backend

- AWS Lambda, Python 3.12
- API Gateway HTTP API
- DynamoDB single-table design
- Cognito user pool and role groups
- S3 private document bucket
- Standard-library unit tests for core rules

### Infrastructure

- Terraform modules under `infrastructure/terraform/modules`
- Environment composition under `infrastructure/terraform/environments/dev`
- Local-only Terraform deployment workflow

## Repository structure

```text
school-management-system/
├── src/                              # Next.js App Router frontend for Vercel
│   ├── app/                          # App Router pages and global CSS
│   ├── components/                   # Reusable UI components
│   └── data/                         # Static module/role metadata for foundation UI
├── backend/                          # Lambda handlers and shared backend logic
│   ├── src/
│   │   ├── handlers/                 # Lambda entry points
│   │   └── shared/                   # HTTP, tenant, validation and domain helpers
│   └── tests/                        # Standard-library unit tests
├── infrastructure/
│   └── terraform/
│       ├── environments/dev/         # Dev environment composition
│       └── modules/                  # Reusable AWS modules
├── docs/                             # Architecture, roadmap, API, security and data model
├── .github/workflows/                # CI quality gates
├── README.md
└── .gitignore
```

This structure keeps the Vercel frontend at the repository root while still separating backend Lambda code and Terraform infrastructure. Vercel can build from `./`, while AWS provisioning remains local-only through Terraform.

## Phase roadmap

### Phase 1 — Foundation

- [x] Repository architecture
- [x] Frontend foundation and dashboard shell
- [x] Backend Lambda foundation, validation, tenant, ID, repository and authorization helpers
- [x] Multi-tenant data model documentation
- [x] Terraform module foundation for Cognito, DynamoDB, S3 and API Gateway/Lambda routes
- [x] CI quality workflow
- [x] School setup APIs
- [x] Academic year, term, class and subject create APIs
- [x] Student, parent/guardian and teacher profile create APIs
- [ ] Cognito-backed application login flow
- [ ] Membership management and role linking APIs
- [ ] List/get/update APIs for setup and people records

### Phase 2 — Academics

- Teacher/class/subject assignments
- Student attendance
- Teacher attendance
- Continuous assessment
- Exams and result calculation

### Phase 3 — Finance

- Fee structures
- Invoices
- Payments
- Balances
- Receipts

### Phase 4 — Dashboards

- Administrator dashboard
- Teacher dashboard
- Parent dashboard
- Student dashboard
- Finance dashboard

### Phase 5 — Production features

- Notifications
- SES email
- Report cards
- S3 document storage flows
- Audit logs
- Advanced reporting

### Phase 6 — SaaS

- Multi-school onboarding
- Tenant administration
- Stronger tenant isolation controls
- Subscription architecture

## Vercel deployment

The Next.js app now lives at the repository root, so Vercel can use `./`.

When importing into Vercel, set:

```text
Root Directory: ./
Framework Preset: Next.js
Install Command: npm ci
Build Command: npm run build
Output Directory: leave empty / default
```

Do not set Output Directory to `public`; this is a Next.js app and Vercel handles the build output automatically. See [`docs/VERCEL_DEPLOYMENT.md`](docs/VERCEL_DEPLOYMENT.md).

## Local frontend development

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>.

Quality checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Backend tests

The current backend foundation uses Python standard-library tests.

```bash
python -m unittest discover -s backend/tests -p 'test_*.py'
```

## Terraform workflow

Terraform is written by the project but applied by the operator locally.

The dev environment uses S3 remote state and DynamoDB locking:

```text
State bucket: osikanyithedev-terraform-state-2026
State key:    school-management-system/dev/terraform.tfstate
Lock table:   osikanyithedev-terraform-locks
```

Create the lock table once before the first init; see [`docs/TERRAFORM_STATE.md`](docs/TERRAFORM_STATE.md).

```bash
cd infrastructure/terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars
terraform init -reconfigure
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
terraform show tfplan
```

Only apply after reviewing the plan:

```bash
terraform apply tfplan
```

## Security rules

- Never commit AWS credentials, API keys, passwords, tokens or secrets.
- Terraform defines IAM and AWS resources; it is not applied automatically from GitHub Actions.
- Cognito groups model application roles.
- Every tenant-owned entity must include a `school_id` and tenant-scoped keys.
- Backend authorization must enforce both role permissions and tenant ownership.
- S3 is private by default.
- Use least-privilege IAM for Lambda functions.

See [`docs/SECURITY.md`](docs/SECURITY.md).

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md)
- [`docs/API.md`](docs/API.md)
- [`docs/AUTHORIZATION.md`](docs/AUTHORIZATION.md)
- [`docs/ROADMAP.md`](docs/ROADMAP.md)
- [`docs/SECURITY.md`](docs/SECURITY.md)
- [`docs/LOCAL_DEPLOYMENT.md`](docs/LOCAL_DEPLOYMENT.md)


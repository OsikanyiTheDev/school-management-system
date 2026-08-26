# Security Decisions

## Credentials

- Do not request, store or use AWS access keys in this repository or chat.
- Terraform is applied only by the operator from their local machine.
- Do not commit `.env`, `.env.local`, `.tfvars`, tokens, API keys or passwords.

## Authentication

Amazon Cognito is the approved identity provider. The Terraform foundation creates:

- User pool
- Public web app client with no client secret
- Optional Hosted UI domain
- Role groups
- Custom user attributes for `school_id` and `person_id`

The frontend login flow will be added in Phase 1 after the infrastructure contract is stable.

## Authorization

- Use least privilege.
- Enforce role and tenant membership.
- Teachers must be restricted to assigned classes/subjects.
- Parents must be restricted to linked children.
- Finance officers must be restricted to their school.

## Data isolation

- Every school-owned entity carries `school_id`.
- DynamoDB keys are tenant-scoped.
- API routes include `school_id` for school-owned resources.
- Cross-tenant queries are forbidden unless performed by a future `PlatformAdmin` route.

## Storage

The S3 bucket is private by default:

- Block public access
- Bucket-owner enforced ownership
- Server-side encryption
- Versioning
- CORS only for approved frontend origins

## Infrastructure safety

- GitHub Actions must validate Terraform, not apply it.
- Review every Terraform plan before apply.
- Do not introduce destructive infrastructure changes without explicit approval.

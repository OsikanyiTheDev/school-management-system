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

The frontend now uses Cognito Hosted UI authorization code + PKCE. ID/access tokens are stored in short-lived HTTP-only cookies by Next.js route handlers and are not exposed to browser JavaScript. Hosted UI branding is presentation-only and does not change the Cognito security boundary.

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

## Bootstrap controls

The first `PlatformAdmin` is assigned from a trusted local AWS CLI environment after the user has signed up and confirmed email in Cognito. This avoids a public self-service platform-admin endpoint.

Use:

```bash
scripts/bootstrap_platform_admin.sh admin@example.com
```

Do not grant `PlatformAdmin` to normal school operators. School-specific admins should be represented as `SchoolAdmin` plus a school membership item.

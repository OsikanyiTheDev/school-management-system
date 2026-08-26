# Terraform Remote State

The SMIS development environment uses the existing shared Terraform state bucket:

```text
bucket: osikanyithedev-terraform-state-2026
region: us-east-1
key:    school-management-system/dev/terraform.tfstate
```

The state key is unique to this project. Do not reuse state keys from Accra Spaces, CivicSignal or other projects.

## Locking

Terraform uses S3 native state locking for this backend:

```hcl
use_lockfile = true
```

This creates a temporary lock file next to the state object while Terraform is running. It avoids the deprecated `dynamodb_table` backend argument and does not require a separate DynamoDB lock table.

Expected state objects:

```text
school-management-system/dev/terraform.tfstate
school-management-system/dev/terraform.tfstate.tflock   # only while Terraform is locked/running
```

## Verify backend bucket

```bash
aws s3api head-bucket \
  --bucket osikanyithedev-terraform-state-2026
```

## Initialize the dev environment

From the dev environment directory:

```bash
cd infrastructure/terraform/environments/dev
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

## Current Vercel origin

The current frontend origin is:

```text
https://ghanaschoolmangement.vercel.app
```

Use that exact origin in `allowed_origins`. Use the same origin plus `/api/auth/callback` and `/` for Cognito callback/logout URLs when auth is enabled.

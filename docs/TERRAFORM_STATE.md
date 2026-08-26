# Terraform Remote State

The SMIS development environment uses the existing shared Terraform state bucket:

```text
bucket: osikanyithedev-terraform-state-2026
region: us-east-1
key:    school-management-system/dev/terraform.tfstate
```

The state key is unique to this project. Do not reuse state keys from Accra Spaces, CivicSignal or other projects.

## Locking

A DynamoDB lock table is used for Terraform state locking:

```text
table: osikanyithedev-terraform-locks
key:   LockID
```

This table can be shared by multiple Terraform projects because Terraform stores the lock by state path. It is separate from application data tables.

## One-time lock table creation

Run this once from your local machine before the first `terraform init` that uses this backend:

```bash
aws dynamodb create-table \
  --table-name osikanyithedev-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --tags Key=Project,Value=TerraformState Key=Owner,Value=OsikanyiTheDev Key=ManagedBy,Value=aws-cli \
  --region us-east-1

aws dynamodb wait table-exists \
  --table-name osikanyithedev-terraform-locks \
  --region us-east-1
```

If the table already exists, AWS will return `ResourceInUseException`; that is safe. Continue to `terraform init -reconfigure`.

## Verify backend resources

```bash
aws s3api head-bucket \
  --bucket osikanyithedev-terraform-state-2026

aws dynamodb describe-table \
  --table-name osikanyithedev-terraform-locks \
  --region us-east-1 \
  --query 'Table.{Name:TableName,Status:TableStatus,BillingMode:BillingModeSummary.BillingMode}'
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

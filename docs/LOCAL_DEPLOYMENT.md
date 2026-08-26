# Local Deployment Guide

## Frontend

```bash
npm ci
npm run dev
```

Vercel should be connected to the GitHub repository and configured with these settings:

```text
Root Directory: ./
Output Directory: empty/default, not public
```

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for the full Vercel handoff.

## Backend tests

```bash
python -m unittest discover -s backend/tests -p 'test_*.py'
```

## Terraform

Run Terraform only from your local machine with your own AWS credentials.

The dev environment uses remote state in your existing S3 bucket with native S3 lock files:

```text
bucket:  osikanyithedev-terraform-state-2026
key:     school-management-system/dev/terraform.tfstate
locking: use_lockfile = true
```

See [TERRAFORM_STATE.md](TERRAFORM_STATE.md).

```bash
cd infrastructure/terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
media_bucket_name = "smis-media-ACCOUNT_ID-2026"
allowed_origins   = ["http://localhost:3000"]
```

If Vercel has a deployment URL, add it to `allowed_origins`, `auth_callback_urls` and `auth_logout_urls`.

Then:

```bash
terraform init -reconfigure
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
terraform show tfplan
```

Review the plan. Only then:

```bash
terraform apply tfplan
```

## Expected early infrastructure

- DynamoDB table
- Private S3 bucket
- Cognito user pool/client/groups
- API Gateway HTTP API
- Lambda health handler
- CloudWatch log groups
- Least-privilege Lambda IAM role

No EC2, NAT Gateway, RDS, ALB or VPC is required for the initial serverless foundation.

## Authentication bootstrap

After Terraform apply, add the deployed values to Vercel as described in [AUTHENTICATION.md](AUTHENTICATION.md), then redeploy the frontend.

To make the first PlatformAdmin, sign up and confirm the user through Cognito, then run from the repository root:

```bash
scripts/bootstrap_platform_admin.sh your-email@example.com
```

See [BOOTSTRAP_PLATFORM_ADMIN.md](BOOTSTRAP_PLATFORM_ADMIN.md).

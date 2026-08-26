# Local Deployment Guide

## Frontend

```bash
cd frontend
npm ci
npm run dev
```

Vercel should be connected to the GitHub repository and configured with this required monorepo setting:

```text
Root Directory: frontend
```

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for the full Vercel handoff.

## Backend tests

```bash
python -m unittest discover -s backend/tests -p 'test_*.py'
```

## Terraform

Run Terraform only from your local machine with your own AWS credentials.

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
terraform init
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

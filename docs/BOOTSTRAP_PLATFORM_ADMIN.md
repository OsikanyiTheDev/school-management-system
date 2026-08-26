# Bootstrap the First PlatformAdmin

The `POST /schools` API requires a Cognito user in the `PlatformAdmin` group. Since no platform admin exists at the beginning, the first admin must be assigned from your local AWS CLI environment.

## Prerequisites

1. Terraform has been applied successfully.
2. Vercel has the Cognito environment variables from [AUTHENTICATION.md](AUTHENTICATION.md).
3. The user has signed up through the app/Cognito and confirmed their email.

Open the app:

```text
https://ghanaschoolmangement.vercel.app/auth
```

Sign up or sign in with the email you want to make PlatformAdmin.

## Add the user to PlatformAdmin

From the repository root on your local machine:

```bash
scripts/bootstrap_platform_admin.sh your-email@example.com
```

The script:

1. Reads `cognito_user_pool_id` from Terraform outputs.
2. Finds the Cognito user by email.
3. Adds the Cognito username to the `PlatformAdmin` group.

After the group assignment, sign out and sign back in so Cognito issues a new token containing the group claim.

## Manual command equivalent

If you prefer manual AWS CLI commands:

```bash
cd infrastructure/terraform/environments/dev
USER_POOL_ID="$(terraform output -raw cognito_user_pool_id)"
EMAIL="your-email@example.com"
USERNAME="$(aws cognito-idp list-users \
  --user-pool-id "$USER_POOL_ID" \
  --filter "email = \"$EMAIL\"" \
  --query 'Users[0].Username' \
  --output text)"

aws cognito-idp admin-add-user-to-group \
  --user-pool-id "$USER_POOL_ID" \
  --username "$USERNAME" \
  --group-name PlatformAdmin
```

## Security note

Do not make regular school administrators `PlatformAdmin`. `PlatformAdmin` is for platform bootstrap/future SaaS operations. School-level administrators should use `SchoolAdmin` and school membership records.

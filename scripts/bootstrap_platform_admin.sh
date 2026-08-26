#!/usr/bin/env bash
set -euo pipefail

EMAIL="${1:-}"
if [[ -z "$EMAIL" ]]; then
  echo "Usage: scripts/bootstrap_platform_admin.sh admin@example.com" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TF_DIR="$ROOT_DIR/infrastructure/terraform/environments/dev"

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI is required." >&2
  exit 1
fi

if ! command -v terraform >/dev/null 2>&1; then
  echo "terraform CLI is required so the script can read outputs." >&2
  exit 1
fi

USER_POOL_ID="$(cd "$TF_DIR" && terraform output -raw cognito_user_pool_id)"
if [[ -z "$USER_POOL_ID" ]]; then
  echo "Could not read cognito_user_pool_id from Terraform outputs." >&2
  exit 1
fi

USERNAME="$(aws cognito-idp list-users \
  --user-pool-id "$USER_POOL_ID" \
  --filter "email = \"$EMAIL\"" \
  --query 'Users[0].Username' \
  --output text)"

if [[ -z "$USERNAME" || "$USERNAME" == "None" ]]; then
  echo "No Cognito user found for $EMAIL." >&2
  echo "Sign up first at https://ghanaschoolmangement.vercel.app/auth and confirm the email." >&2
  exit 1
fi

aws cognito-idp admin-add-user-to-group \
  --user-pool-id "$USER_POOL_ID" \
  --username "$USERNAME" \
  --group-name PlatformAdmin

echo "Added $EMAIL ($USERNAME) to PlatformAdmin in user pool $USER_POOL_ID."
echo "Sign out and sign back in so Cognito issues a new token with the PlatformAdmin group."

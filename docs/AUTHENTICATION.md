# Authentication

SMIS uses Amazon Cognito verified-email authentication with OAuth authorization code + PKCE.

## Current deployed dev values

```env
AUTH_BASE_URL=https://ghanaschoolmangement.vercel.app
API_URL=https://6fi97qfd2c.execute-api.us-east-1.amazonaws.com
NEXT_PUBLIC_API_URL=https://6fi97qfd2c.execute-api.us-east-1.amazonaws.com
COGNITO_DOMAIN=https://smis-dev-360831508664.auth.us-east-1.amazoncognito.com
COGNITO_CLIENT_ID=4nvgnjt6j6i3lmkioaqai135a4
COGNITO_USER_POOL_ID=us-east-1_Mi0tQlCG6
COGNITO_REGION=us-east-1
```

These values are not AWS credentials. Do not add AWS access keys or secret keys to Vercel or frontend files.


## Branded Cognito screen

The Cognito Hosted UI is themed through Terraform so it matches the SMIS frontend more closely while Cognito remains the password-entry security boundary.

Theme file:

```text
infrastructure/terraform/modules/auth/assets/hosted-ui.css
```

Terraform resource:

```text
aws_cognito_user_pool_ui_customization.web
```

See [COGNITO_BRANDING.md](COGNITO_BRANDING.md).

## Browser flow

```text
Browser
  → GET /api/auth/login
  → state + PKCE verifier stored in short-lived HTTP-only cookies
  → Cognito Hosted UI /oauth2/authorize
  → GET /api/auth/callback?code=…&state=…
  → state checked
  → code exchanged server-side using PKCE verifier
  → ID token verified against Cognito JWKS
  → ID/access tokens stored in short-lived HttpOnly cookies
  → /account
```

The access token is not exposed to browser JavaScript.

## Vercel environment variables

Add these to the Vercel project as Production environment variables:

```env
AUTH_BASE_URL=https://ghanaschoolmangement.vercel.app
API_URL=https://6fi97qfd2c.execute-api.us-east-1.amazonaws.com
NEXT_PUBLIC_API_URL=https://6fi97qfd2c.execute-api.us-east-1.amazonaws.com
COGNITO_DOMAIN=https://smis-dev-360831508664.auth.us-east-1.amazoncognito.com
COGNITO_CLIENT_ID=4nvgnjt6j6i3lmkioaqai135a4
COGNITO_USER_POOL_ID=us-east-1_Mi0tQlCG6
COGNITO_REGION=us-east-1
```

Then redeploy Vercel.

## Cognito callback/logout URLs

Already configured by Terraform:

```text
Callback: http://localhost:3000/api/auth/callback
Callback: https://ghanaschoolmangement.vercel.app/api/auth/callback

Logout:   http://localhost:3000/
Logout:   https://ghanaschoolmangement.vercel.app/
```

If the Vercel domain changes, update Terraform `auth_callback_urls`, `auth_logout_urls`, `allowed_origins`, and Vercel `AUTH_BASE_URL` together.

## Routes added in the frontend

```text
GET /auth
GET /account
GET /api/auth/login
GET /api/auth/callback
GET /api/auth/logout
GET /api/auth/session
```

## First PlatformAdmin bootstrap

The first platform administrator cannot be created by public signup alone. After a user signs up and confirms email through Cognito, run the local bootstrap script from your machine:

```bash
scripts/bootstrap_platform_admin.sh your-email@example.com
```

See [BOOTSTRAP_PLATFORM_ADMIN.md](BOOTSTRAP_PLATFORM_ADMIN.md).

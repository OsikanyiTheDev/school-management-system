# Vercel Deployment

The Next.js frontend now lives at the repository root, so Vercel can build the project from `./`.

## Required Vercel settings

When importing `OsikanyiTheDev/school-management-system` into Vercel, use these settings:

```text
Root Directory: ./
Framework Preset: Next.js
Install Command: npm ci
Build Command: npm run build
Output Directory: leave empty / default
```

Important: **do not set Output Directory to `public`**. This is a Next.js app, not a static public-folder deployment. Vercel handles the `.next` build output automatically when the framework is Next.js.

## Common deployment errors

### Error: No Next.js version detected

Cause: Vercel is not building from the directory that contains `package.json`.

Fix: after this flattening change, use the repository root:

```text
Settings → General → Root Directory → ./
```

### Error: No Output Directory named "public" found

```text
Error: No Output Directory named "public" found after the Build completed.
```

Cause: Vercel Project Settings has `Output Directory` set to `public`.

Fix:

```text
Settings → Build and Deployment → Output Directory → clear the field / leave blank
```

Then redeploy. The build should use Next.js defaults.

## Environment variables

Add these Vercel Production environment variables for the deployed dev backend:

```env
AUTH_BASE_URL=https://ghanaschoolmangement.vercel.app
API_URL=https://6fi97qfd2c.execute-api.us-east-1.amazonaws.com
NEXT_PUBLIC_API_URL=https://6fi97qfd2c.execute-api.us-east-1.amazonaws.com
COGNITO_DOMAIN=https://smis-dev-360831508664.auth.us-east-1.amazoncognito.com
COGNITO_CLIENT_ID=4nvgnjt6j6i3lmkioaqai135a4
COGNITO_USER_POOL_ID=us-east-1_Mi0tQlCG6
COGNITO_REGION=us-east-1
```

Redeploy Vercel after adding/changing environment variables.

## Redeploy after fixing settings

In Vercel:

1. Open the SMIS project.
2. Go to **Settings → General**.
3. Set **Root Directory** to the repository root:

```text
./
```

4. Go to **Settings → Build and Deployment**.
5. Make sure **Output Directory** is empty/default, not `public`.
6. Go to **Deployments**.
7. Click the failed deployment.
8. Choose **Redeploy**.

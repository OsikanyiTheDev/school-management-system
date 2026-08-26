# Vercel Deployment

This repository is a monorepo. The Next.js application lives in `frontend/`, not the repository root.

## Required Vercel settings

When importing `OsikanyiTheDev/school-management-system` into Vercel, use these exact settings:

```text
Root Directory: frontend
Framework Preset: Next.js
Install Command: npm ci
Build Command: npm run build
Output Directory: leave empty / default
```

Important: **do not set Output Directory to `public`**. This is a Next.js app, not a static public-folder deployment. Vercel handles the `.next` build output automatically when the framework is Next.js.

## Common deployment errors

### Error: No Next.js version detected

```text
No Next.js version detected. Make sure your package.json has "next"...
```

Cause: Vercel is building the repository root instead of `frontend/`.

Fix:

```text
Settings → General → Root Directory → frontend
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

For the current Phase 1 foundation UI, no AWS environment variables are required.

After the AWS backend is deployed locally with Terraform, add the eventual API/Cognito values in Vercel Production variables. The exact variable names will be documented when the frontend authentication flow is implemented.

## Redeploy after fixing settings

In Vercel:

1. Open the SMIS project.
2. Go to **Settings → General**.
3. Set **Root Directory** to:

```text
frontend
```

4. Go to **Settings → Build and Deployment**.
5. Make sure **Output Directory** is empty/default, not `public`.
6. Go to **Deployments**.
7. Click the failed deployment.
8. Choose **Redeploy**.

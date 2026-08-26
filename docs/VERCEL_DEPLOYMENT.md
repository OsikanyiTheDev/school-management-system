# Vercel Deployment

This repository is a monorepo. The Next.js application lives in `frontend/`, not the repository root.

## Required Vercel setting

When importing `OsikanyiTheDev/school-management-system` into Vercel, set:

```text
Root Directory: frontend
Framework Preset: Next.js
Install Command: npm ci
Build Command: npm run build
Output Directory: leave blank
```

If `Root Directory` is left as the repository root, Vercel will fail with:

```text
No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies".
```

That error happens because the root of the repository does not contain the Next.js `package.json`; `frontend/package.json` does.

## Environment variables

For the current Phase 1 foundation UI, no AWS environment variables are required.

After the AWS backend is deployed locally with Terraform, add the eventual API/Cognito values in Vercel Production variables. The exact variable names will be documented when the frontend authentication flow is implemented.

## Redeploy after fixing Root Directory

In Vercel:

1. Open the SMIS project.
2. Go to **Settings → General**.
3. Find **Root Directory**.
4. Set it to:

```text
frontend
```

5. Save.
6. Go to **Deployments**.
7. Click the failed deployment.
8. Choose **Redeploy**.

Or push a new commit after changing the setting.

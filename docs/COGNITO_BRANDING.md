# Cognito Hosted UI Branding

SMIS keeps password entry, email verification and account recovery inside Amazon Cognito, but applies a custom Hosted UI theme so the sign-in experience feels like part of the SMIS product.

## Why this approach

The approved security model uses Cognito Hosted UI with OAuth authorization code + PKCE. That keeps password handling out of the Next.js application while still allowing a branded sign-in screen.

We are not building a custom password form in the frontend at this stage because that would move more authentication responsibility into application code.

## Terraform resource

Branding is managed in Terraform with:

```hcl
resource "aws_cognito_user_pool_ui_customization" "web" {
  client_id    = aws_cognito_user_pool_client.web.id
  user_pool_id = aws_cognito_user_pool.main.id
  css          = file("${path.module}/assets/hosted-ui.css")
}
```

Theme file:

```text
infrastructure/terraform/modules/auth/assets/hosted-ui.css
```

## Applying the branding

After pulling the commit that adds this resource, run locally:

```bash
cd infrastructure/terraform/environments/dev
terraform init -reconfigure
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
terraform show tfplan
```

Expected Terraform change:

```text
+ aws_cognito_user_pool_ui_customization.web
```

Then apply after review:

```bash
terraform apply tfplan
```

## Notes

- The Cognito Hosted UI domain remains `https://smis-dev-360831508664.auth.us-east-1.amazoncognito.com`.
- The frontend `/auth` page is already branded; this CSS customizes the Cognito-hosted screen that opens after clicking sign in.
- If the CSS does not appear immediately, wait a short moment, clear browser cache, or open the login URL in a private window.


## Cognito CSS constraints

Cognito validates Hosted UI CSS against a strict allowlist. Keep selectors simple and individual, for example:

```css
.label-customizable { ... }
.textDescription-customizable { ... }
```

Do not use comma-grouped selectors such as:

```css
.label-customizable,
.textDescription-customizable { ... }
```

Cognito can reject grouped selectors as an invalid class name.


## Current layout adjustment

The Hosted UI CSS intentionally adds top spacing through `.background-customizable` and `.banner-customizable` so the Cognito form sits lower and feels centered vertically instead of appearing tight to the top of the page.

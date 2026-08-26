locals {
  groups = {
    PlatformAdmin  = "Platform-level operators for future SaaS administration."
    SchoolAdmin    = "School administrators with full tenant management access."
    Teacher        = "Teachers with assigned class and subject access."
    Student        = "Students with self-service academic and finance visibility."
    ParentGuardian = "Parents/guardians with child-linked visibility."
    FinanceOfficer = "Finance officers with fee, invoice and payment access."
  }
}

resource "aws_cognito_user_pool" "main" {
  name = "${var.name_prefix}-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  password_policy {
    minimum_length                   = 10
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = false
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  schema {
    name                = "school_id"
    attribute_data_type = "String"
    mutable             = true
    required            = false

    string_attribute_constraints {
      min_length = 0
      max_length = 64
    }
  }

  schema {
    name                = "person_id"
    attribute_data_type = "String"
    mutable             = true
    required            = false

    string_attribute_constraints {
      min_length = 0
      max_length = 80
    }
  }

  mfa_configuration = "OPTIONAL"

  software_token_mfa_configuration {
    enabled = true
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.name_prefix}-web"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret                      = false
  callback_urls                        = var.callback_urls
  logout_urls                          = var.logout_urls
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  supported_identity_providers         = ["COGNITO"]
  prevent_user_existence_errors        = "ENABLED"

  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]

  access_token_validity  = var.access_token_validity
  id_token_validity      = var.id_token_validity
  refresh_token_validity = var.refresh_token_validity

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}

resource "aws_cognito_user_pool_domain" "main" {
  count        = var.cognito_domain_prefix == "" ? 0 : 1
  domain       = var.cognito_domain_prefix
  user_pool_id = aws_cognito_user_pool.main.id
}

resource "aws_cognito_user_pool_ui_customization" "web" {
  client_id    = aws_cognito_user_pool_client.web.id
  user_pool_id = aws_cognito_user_pool.main.id
  css          = file("${path.module}/assets/hosted-ui.css")
}

resource "aws_cognito_user_group" "roles" {
  for_each     = local.groups
  name         = each.key
  user_pool_id = aws_cognito_user_pool.main.id
  description  = each.value
}

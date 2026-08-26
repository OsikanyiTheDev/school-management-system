output "user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "user_pool_arn" {
  value = aws_cognito_user_pool.main.arn
}

output "user_pool_client_id" {
  value = aws_cognito_user_pool_client.web.id
}

output "issuer" {
  value = "https://cognito-idp.${data.aws_region.current.name}.amazonaws.com/${aws_cognito_user_pool.main.id}"
}

output "domain_url" {
  value = var.cognito_domain_prefix == "" ? null : "https://${var.cognito_domain_prefix}.auth.${data.aws_region.current.name}.amazoncognito.com"
}

data "aws_region" "current" {}

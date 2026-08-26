output "api_url" {
  value       = module.api.api_endpoint
  description = "Base URL of the SMIS HTTP API."
}

output "listings_note" {
  value       = "SMIS uses a tenant-scoped DynamoDB table named ${module.data_store.table_name}."
  description = "Human-readable data store note."
}

output "dynamodb_table_name" {
  value       = module.data_store.table_name
  description = "Main multi-tenant DynamoDB table name."
}

output "media_bucket_name" {
  value       = module.media_storage.bucket_name
  description = "Private S3 bucket for documents/media."
}

output "cognito_user_pool_id" {
  value       = module.auth.user_pool_id
  description = "Cognito user pool ID."
}

output "cognito_user_pool_client_id" {
  value       = module.auth.user_pool_client_id
  description = "Cognito app client ID."
}

output "cognito_domain_url" {
  value       = module.auth.domain_url
  description = "Cognito Hosted UI domain URL, if configured."
}

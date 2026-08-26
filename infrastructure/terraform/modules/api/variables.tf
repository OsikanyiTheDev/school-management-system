variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "lambda_source_dir" {
  type        = string
  description = "Path to backend Lambda source directory."
}

variable "allowed_origins" {
  type        = list(string)
  description = "Allowed CORS origins."
}

variable "log_retention_days" {
  type        = number
  description = "CloudWatch log retention in days."
}

variable "table_name" {
  type        = string
  description = "DynamoDB table name."
}

variable "table_arn" {
  type        = string
  description = "DynamoDB table ARN."
}

variable "media_bucket_name" {
  type        = string
  description = "Private media/document bucket name."
}

variable "media_bucket_arn" {
  type        = string
  description = "Private media/document bucket ARN."
}

variable "cognito_user_pool_id" {
  type        = string
  description = "Cognito user pool ID."
}

variable "cognito_user_pool_client_id" {
  type        = string
  description = "Cognito app client ID."
}

variable "cognito_user_pool_issuer" {
  type        = string
  description = "Cognito issuer URL."
}

variable "environment" {
  type        = string
  description = "Environment name."
}

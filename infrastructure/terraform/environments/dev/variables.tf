variable "aws_region" {
  type        = string
  description = "AWS region for the development environment."
  default     = "us-east-1"
}

variable "project_slug" {
  type        = string
  description = "Short lowercase project slug used in resource names."
  default     = "smis"
}

variable "environment" {
  type        = string
  description = "Deployment environment name."
  default     = "dev"
}

variable "owner" {
  type        = string
  description = "Resource owner tag."
  default     = "OsikanyiTheDev"
}

variable "allowed_origins" {
  type        = list(string)
  description = "Allowed frontend origins for API and S3 CORS."
  default     = ["http://localhost:3000"]
}

variable "cognito_domain_prefix" {
  type        = string
  description = "Globally unique Cognito hosted UI domain prefix. Leave empty to skip domain creation until ready."
  default     = ""
}

variable "auth_callback_urls" {
  type        = list(string)
  description = "Allowed Cognito OAuth callback URLs."
  default     = ["http://localhost:3000/api/auth/callback"]
}

variable "auth_logout_urls" {
  type        = list(string)
  description = "Allowed Cognito OAuth logout URLs."
  default     = ["http://localhost:3000/"]
}

variable "media_bucket_name" {
  type        = string
  description = "Globally unique private S3 bucket for school documents and future media."
}

variable "log_retention_days" {
  type        = number
  description = "CloudWatch log retention for dev Lambda/API logs."
  default     = 14
}

variable "name_prefix" {
  type        = string
  description = "Resource name prefix."
}

variable "cognito_domain_prefix" {
  type        = string
  description = "Optional Cognito hosted UI domain prefix."
  default     = ""
}

variable "callback_urls" {
  type        = list(string)
  description = "OAuth callback URLs."
}

variable "logout_urls" {
  type        = list(string)
  description = "OAuth logout URLs."
}

variable "access_token_validity" {
  type        = number
  description = "Access token validity in minutes."
  default     = 60
}

variable "id_token_validity" {
  type        = number
  description = "ID token validity in minutes."
  default     = 60
}

variable "refresh_token_validity" {
  type        = number
  description = "Refresh token validity in days."
  default     = 1
}

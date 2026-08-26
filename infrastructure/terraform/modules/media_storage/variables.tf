variable "bucket_name" {
  type        = string
  description = "Globally unique private media/document bucket name."
}

variable "allowed_origins" {
  type        = list(string)
  description = "Allowed web origins for direct browser uploads/downloads."
}

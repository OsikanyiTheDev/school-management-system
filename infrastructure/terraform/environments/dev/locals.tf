locals {
  name_prefix = "${var.project_slug}-${var.environment}"
  tags = {
    Project     = "SchoolManagementSystem"
    Environment = var.environment
    ManagedBy   = "terraform"
    Owner       = var.owner
  }
}

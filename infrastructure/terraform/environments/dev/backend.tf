terraform {
  backend "s3" {
    bucket         = "osikanyithedev-terraform-state-2026"
    key            = "school-management-system/dev/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "osikanyithedev-terraform-locks"
  }
}

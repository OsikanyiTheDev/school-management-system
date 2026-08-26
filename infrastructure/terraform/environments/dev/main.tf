module "data_store" {
  source      = "../../modules/data_store"
  name_prefix = local.name_prefix
}

module "media_storage" {
  source          = "../../modules/media_storage"
  bucket_name     = var.media_bucket_name
  allowed_origins = var.allowed_origins
}

module "auth" {
  source                 = "../../modules/auth"
  name_prefix            = local.name_prefix
  cognito_domain_prefix  = var.cognito_domain_prefix
  callback_urls          = var.auth_callback_urls
  logout_urls            = var.auth_logout_urls
  access_token_validity  = 60
  id_token_validity      = 60
  refresh_token_validity = 1
}

module "api" {
  source                      = "../../modules/api"
  name_prefix                 = local.name_prefix
  lambda_source_dir           = "${path.root}/../../../../backend/src"
  allowed_origins             = var.allowed_origins
  log_retention_days          = var.log_retention_days
  table_name                  = module.data_store.table_name
  table_arn                   = module.data_store.table_arn
  media_bucket_name           = module.media_storage.bucket_name
  media_bucket_arn            = module.media_storage.bucket_arn
  cognito_user_pool_id        = module.auth.user_pool_id
  cognito_user_pool_client_id = module.auth.user_pool_client_id
  cognito_user_pool_issuer    = module.auth.issuer
  environment                 = var.environment
}

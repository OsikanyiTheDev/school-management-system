data "archive_file" "api" {
  type        = "zip"
  source_dir  = var.lambda_source_dir
  output_path = "${path.module}/smis-api.zip"
}

locals {
  functions = {
    health = {
      handler   = "handlers.health.lambda_handler"
      route_key = "GET /health"
      auth      = "NONE"
    }
    create_school = {
      handler   = "handlers.create_school.lambda_handler"
      route_key = "POST /schools"
      auth      = "JWT"
    }
    get_school = {
      handler   = "handlers.get_school.lambda_handler"
      route_key = "GET /schools/{school_id}"
      auth      = "JWT"
    }
    create_academic_year = {
      handler   = "handlers.create_academic_year.lambda_handler"
      route_key = "POST /schools/{school_id}/academic-years"
      auth      = "JWT"
    }
    create_term = {
      handler   = "handlers.create_term.lambda_handler"
      route_key = "POST /schools/{school_id}/terms"
      auth      = "JWT"
    }
    create_class = {
      handler   = "handlers.create_class.lambda_handler"
      route_key = "POST /schools/{school_id}/classes"
      auth      = "JWT"
    }
    create_subject = {
      handler   = "handlers.create_subject.lambda_handler"
      route_key = "POST /schools/{school_id}/subjects"
      auth      = "JWT"
    }
    create_student = {
      handler   = "handlers.create_student.lambda_handler"
      route_key = "POST /schools/{school_id}/students"
      auth      = "JWT"
    }
    create_teacher = {
      handler   = "handlers.create_teacher.lambda_handler"
      route_key = "POST /schools/{school_id}/teachers"
      auth      = "JWT"
    }
    create_guardian = {
      handler   = "handlers.create_guardian.lambda_handler"
      route_key = "POST /schools/{school_id}/guardians"
      auth      = "JWT"
    }
  }
}

resource "aws_iam_role" "lambda" {
  name = "${var.name_prefix}-api-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "basic_execution" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "data_access" {
  name = "${var.name_prefix}-api-data-access"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "TenantTableAccess"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
        ]
        Resource = [var.table_arn, "${var.table_arn}/index/*"]
      },
      {
        Sid    = "PrivateDocumentAccess"
        Effect = "Allow"
        Action = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = ["${var.media_bucket_arn}/schools/*"]
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "lambda" {
  for_each          = local.functions
  name              = "/aws/lambda/${var.name_prefix}-${each.key}"
  retention_in_days = var.log_retention_days
}

resource "aws_lambda_function" "api" {
  for_each         = local.functions
  function_name    = "${var.name_prefix}-${each.key}"
  description      = "SMIS ${replace(each.key, "_", " ")} API handler"
  filename         = data.archive_file.api.output_path
  source_code_hash = data.archive_file.api.output_base64sha256
  role             = aws_iam_role.lambda.arn
  handler          = each.value.handler
  runtime          = "python3.12"
  timeout          = 15
  memory_size      = 256

  environment {
    variables = {
      ENVIRONMENT          = var.environment
      TABLE_NAME           = var.table_name
      MEDIA_BUCKET         = var.media_bucket_name
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda,
    aws_iam_role_policy_attachment.basic_execution,
    aws_iam_role_policy.data_access,
  ]
}

resource "aws_apigatewayv2_api" "public" {
  name          = "${var.name_prefix}-api"
  protocol_type = "HTTP"
  description   = "School Management Information System API"

  cors_configuration {
    allow_credentials = false
    allow_headers     = ["content-type", "authorization"]
    allow_methods     = ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
    allow_origins     = var.allowed_origins
    max_age           = 300
  }
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.name_prefix}"
  retention_in_days = var.log_retention_days
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.public.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${var.name_prefix}-cognito-jwt"

  jwt_configuration {
    audience = [var.cognito_user_pool_client_id]
    issuer   = var.cognito_user_pool_issuer
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.public.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      sourceIp       = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      responseLength = "$context.responseLength"
    })
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  for_each               = local.functions
  api_id                 = aws_apigatewayv2_api.public.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api[each.key].invoke_arn
  payload_format_version = "2.0"
  integration_method     = "POST"
}

resource "aws_apigatewayv2_route" "lambda" {
  for_each           = local.functions
  api_id             = aws_apigatewayv2_api.public.id
  route_key          = each.value.route_key
  target             = "integrations/${aws_apigatewayv2_integration.lambda[each.key].id}"
  authorization_type = each.value.auth
  authorizer_id      = each.value.auth == "JWT" ? aws_apigatewayv2_authorizer.cognito.id : null
}

resource "aws_lambda_permission" "api_gateway" {
  for_each      = local.functions
  statement_id  = "AllowApiGatewayInvoke-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.public.execution_arn}/*/*"
}

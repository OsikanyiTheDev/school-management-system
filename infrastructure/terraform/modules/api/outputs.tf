output "api_endpoint" {
  value = aws_apigatewayv2_api.public.api_endpoint
}

output "api_execution_arn" {
  value = aws_apigatewayv2_api.public.execution_arn
}

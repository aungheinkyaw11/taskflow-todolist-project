output "policy_arn" {
  value = aws_iam_policy.controller.arn
}

output "role_arn" {
  value = aws_iam_role.controller.arn
}

output "service_account_name" {
  value = kubernetes_service_account_v1.controller.metadata[0].name
}

output "status" {
  value = helm_release.controller.status
}

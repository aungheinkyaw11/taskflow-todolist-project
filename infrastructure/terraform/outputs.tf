output "vpc_id" {
  value = module.vpc.vpc_id
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "database_endpoint" {
  value = module.rds.endpoint
}

output "database_port" {
  value = module.rds.port
}

output "database_name" {
  value = module.rds.database_name
}

output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "node_group_name" {
  value = module.eks.node_group_name
}

output "argocd_namespace" {
  value = module.argocd.argocd_namespace
}

output "argocd_status" {
  value = module.argocd.argocd_status
}

output "monitoring_namespace" {
  value = module.monitoring.namespace
}

output "monitoring_status" {
  value = module.monitoring.status
}

output "aws_load_balancer_controller_role_arn" {
  value = module.aws_load_balancer_controller.role_arn
}

output "aws_load_balancer_controller_status" {
  value = module.aws_load_balancer_controller.status
}

output "gateway_api_crds_count" {
  value = module.gateway_api_crds.crd_count
}

output "nginx_gateway_fabric_namespace" {
  value = module.nginx_gateway_fabric.namespace
}

output "nginx_gateway_fabric_status" {
  value = module.nginx_gateway_fabric.status
}

output "configure_kubeconfig_command" {
  value = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name} --profile ${var.aws_profile}"
}

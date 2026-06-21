output "release_name" {
  value = helm_release.nginx_gateway_fabric.name
}

output "namespace" {
  value = helm_release.nginx_gateway_fabric.namespace
}

output "status" {
  value = helm_release.nginx_gateway_fabric.status
}

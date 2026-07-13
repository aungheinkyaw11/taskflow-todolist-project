output "release_name" {
  value = helm_release.monitoring.name
}

output "namespace" {
  value = helm_release.monitoring.namespace
}

output "status" {
  value = helm_release.monitoring.status
}

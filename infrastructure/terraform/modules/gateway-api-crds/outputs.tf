output "manifest_url" {
  value = local.manifest_url
}

output "crd_count" {
  value = length(kubectl_manifest.gateway_api_standard)
}

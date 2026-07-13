locals {
  manifest_url = coalesce(
    var.manifest_url,
    "https://github.com/kubernetes-sigs/gateway-api/releases/download/${var.gateway_api_version}/standard-install.yaml"
  )
}

data "http" "gateway_api_standard" {
  url = local.manifest_url
}

data "kubectl_file_documents" "gateway_api_standard" {
  content = data.http.gateway_api_standard.response_body
}

resource "kubectl_manifest" "gateway_api_standard" {
  for_each = data.kubectl_file_documents.gateway_api_standard.manifests

  yaml_body         = each.value
  server_side_apply = true
  force_conflicts   = true
}

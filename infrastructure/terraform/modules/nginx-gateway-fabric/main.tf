resource "kubernetes_namespace_v1" "nginx_gateway" {
  metadata {
    name = var.namespace
  }
}

resource "helm_release" "nginx_gateway_fabric" {
  name       = var.release_name
  repository = var.chart_repository
  chart      = var.chart_name
  version    = var.chart_version
  namespace  = kubernetes_namespace_v1.nginx_gateway.metadata[0].name

  wait    = true
  timeout = var.timeout

  set {
    name  = "nginx.service.type"
    value = var.service_type
  }

  depends_on = [
    kubernetes_namespace_v1.nginx_gateway
  ]
}

variable "release_name" {
  description = "Helm release name for NGINX Gateway Fabric."
  type        = string
  default     = "ngf"
}

variable "namespace" {
  description = "Kubernetes namespace where NGINX Gateway Fabric will be installed."
  type        = string
  default     = "nginx-gateway"
}

variable "chart_repository" {
  description = "OCI Helm repository for NGINX Gateway Fabric."
  type        = string
  default     = "oci://ghcr.io/nginx/charts"
}

variable "chart_name" {
  description = "NGINX Gateway Fabric Helm chart name."
  type        = string
  default     = "nginx-gateway-fabric"
}

variable "chart_version" {
  description = "NGINX Gateway Fabric Helm chart version."
  type        = string
  default     = "2.4.2"
}

variable "service_type" {
  description = "NGINX Gateway Fabric data plane service type."
  type        = string
  default     = "ClusterIP"
}

variable "timeout" {
  description = "Time in seconds to wait for the Helm release to become ready."
  type        = number
  default     = 600
}

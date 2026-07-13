variable "release_name" {
  description = "Helm release name for kube-prometheus-stack."
  type        = string
  default     = "kube-prometheus-stack"
}

variable "namespace" {
  description = "Kubernetes namespace where monitoring stack will be installed."
  type        = string
  default     = "monitoring"
}

variable "chart_version" {
  description = "kube-prometheus-stack Helm chart version."
  type        = string
  default     = "56.21.0"
}

variable "timeout" {
  description = "Time in seconds to wait for the Helm release to become ready."
  type        = number
  default     = 600
}

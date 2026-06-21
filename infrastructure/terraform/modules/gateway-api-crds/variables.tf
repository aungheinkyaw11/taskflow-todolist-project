variable "gateway_api_version" {
  description = "Gateway API release version to install."
  type        = string
  default     = "v1.2.1"
}

variable "manifest_url" {
  description = "Gateway API standard install manifest URL. If null, the URL is built from gateway_api_version."
  type        = string
  default     = null
}

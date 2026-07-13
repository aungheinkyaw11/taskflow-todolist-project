variable "cluster_name" {
  description = "EKS cluster name."
  type        = string
}

variable "aws_region" {
  description = "AWS region where the EKS cluster runs."
  type        = string
}

variable "vpc_id" {
  description = "VPC ID used by the EKS cluster."
  type        = string
}

variable "oidc_provider_arn" {
  description = "EKS IAM OIDC provider ARN."
  type        = string
}

variable "oidc_issuer_url" {
  description = "EKS OIDC issuer URL."
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace for AWS Load Balancer Controller."
  type        = string
  default     = "kube-system"
}

variable "service_account_name" {
  description = "Kubernetes service account name for AWS Load Balancer Controller."
  type        = string
  default     = "aws-load-balancer-controller"
}

variable "policy_name" {
  description = "IAM policy name for AWS Load Balancer Controller."
  type        = string
  default     = "AWSLoadBalancerControllerIAMPolicy"
}

variable "role_name" {
  description = "IAM role name for AWS Load Balancer Controller."
  type        = string
  default     = "AmazonEKSLoadBalancerControllerRole"
}

variable "chart_version" {
  description = "Helm chart version for AWS Load Balancer Controller. Null uses the latest available chart."
  type        = string
  default     = null
}

variable "controller_policy_version" {
  description = "AWS Load Balancer Controller release version used to fetch the IAM policy document."
  type        = string
  default     = "v3.4.0"
}

variable "timeout" {
  description = "Time in seconds to wait for the Helm release to become ready."
  type        = number
  default     = 600
}

variable "project_name" {
  description = "Short project name used in AWS resource names."
  type        = string
  default     = "taskflow"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the EKS VPC."
  type        = string
  default     = "10.20.0.0/16"
}

variable "aws_region" {
  description = "AWS region to deploy resources."
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to use for authentication."
  type        = string
}

variable "cluster_name" {
  description = "EKS cluster name for subnet tagging"
  type        = string
  default     = "taskflow-cluster"
}

variable "cluster_version" {
  description = "EKS Kubernetes version."
  type        = string
  default     = "1.33"
}

variable "endpoint_public_access_cidrs" {
  description = "CIDR blocks allowed to access the public EKS Kubernetes API endpoint."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "node_group_name" {
  description = "EKS managed node group name."
  type        = string
  default     = "taskflow-node-group"
}

variable "node_instance_types" {
  description = "EC2 instance types for the EKS managed node group."
  type        = list(string)
  default     = ["t3.medium"]
}

variable "node_capacity_type" {
  description = "Capacity type for the node group. Use ON_DEMAND or SPOT."
  type        = string
  default     = "ON_DEMAND"
}

variable "node_group_desired_size" {
  description = "Desired number of EKS managed node group instances."
  type        = number
  default     = 1
}

variable "node_group_min_size" {
  description = "Minimum number of EKS managed node group instances."
  type        = number
  default     = 1
}

variable "node_group_max_size" {
  description = "Maximum number of EKS managed node group instances."
  type        = number
  default     = 2
}

variable "node_group_disk_size" {
  description = "Disk size in GiB for each EKS managed node group instance."
  type        = number
  default     = 30
}

variable "repositories" {
  type = list(string)
}

variable "database_name" {
  description = "PostgreSQL database name."
  type        = string
  default     = "taskflow_db"
}

variable "database_username" {
  description = "PostgreSQL master username."
  type        = string
  default     = "taskflow_user"
}

variable "database_password" {
  description = "PostgreSQL master password."
  type        = string
  sensitive   = true
}

variable "database_engine_version" {
  description = "PostgreSQL engine version."
  type        = string
  default     = "15.10"
}

variable "database_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "database_allocated_storage" {
  description = "Allocated RDS storage in GiB."
  type        = number
  default     = 20
}

variable "database_deletion_protection" {
  description = "Whether to enable deletion protection for the RDS instance."
  type        = bool
  default     = false
}

variable "database_skip_final_snapshot" {
  description = "Whether to skip the final snapshot when deleting the RDS instance."
  type        = bool
  default     = true
}

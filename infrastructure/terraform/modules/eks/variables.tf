variable "cluster_name" {
  description = "EKS cluster name."
  type        = string
}

variable "cluster_version" {
  description = "EKS Kubernetes version."
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for the EKS cluster and managed node group."
  type        = list(string)
}

variable "node_group_name" {
  description = "EKS managed node group name."
  type        = string
}

variable "node_instance_types" {
  description = "EC2 instance types for the EKS managed node group."
  type        = list(string)
}

variable "node_capacity_type" {
  description = "Capacity type for the node group. Use ON_DEMAND or SPOT."
  type        = string
}

variable "node_group_desired_size" {
  description = "Desired number of EKS managed node group instances."
  type        = number
}

variable "node_group_min_size" {
  description = "Minimum number of EKS managed node group instances."
  type        = number
}

variable "node_group_max_size" {
  description = "Maximum number of EKS managed node group instances."
  type        = number
}

variable "node_group_disk_size" {
  description = "Disk size in GiB for each EKS managed node group instance."
  type        = number
}

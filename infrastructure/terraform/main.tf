module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  cluster_name = var.cluster_name
}

module "eks" {
  source = "./modules/eks"

  cluster_name                 = var.cluster_name
  cluster_version              = var.cluster_version
  private_subnet_ids           = module.vpc.private_subnet_ids
  endpoint_public_access_cidrs = var.endpoint_public_access_cidrs

  node_group_name         = var.node_group_name
  node_instance_types     = var.node_instance_types
  node_capacity_type      = var.node_capacity_type
  node_group_desired_size = var.node_group_desired_size
  node_group_min_size     = var.node_group_min_size
  node_group_max_size     = var.node_group_max_size
  node_group_disk_size    = var.node_group_disk_size

  depends_on = [module.vpc]
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  repositories = var.repositories
}

module "rds" {
  source = "./modules/rds"

  project_name        = var.project_name
  environment         = var.environment
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.private_subnet_ids
  allowed_cidr_blocks = module.vpc.private_subnet_cidrs
  database_name       = var.database_name
  database_username   = var.database_username
  database_password   = var.database_password
  engine_version      = var.database_engine_version
  instance_class      = var.database_instance_class
  allocated_storage   = var.database_allocated_storage
  deletion_protection = var.database_deletion_protection
  skip_final_snapshot = var.database_skip_final_snapshot

  depends_on = [module.vpc]
}

data "aws_eks_cluster_auth" "eks" {
  name       = module.eks.cluster_name
  depends_on = [module.eks]
}

provider "kubernetes" {
  alias                  = "eks"
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  token                  = data.aws_eks_cluster_auth.eks.token
}

provider "helm" {
  alias = "eks"
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
    token                  = data.aws_eks_cluster_auth.eks.token
  }
}

provider "kubectl" {
  alias                  = "eks"
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  token                  = data.aws_eks_cluster_auth.eks.token
  load_config_file       = false
}

module "argocd" {
  source = "./modules/argocd"

  providers = {
    helm       = helm.eks
    kubernetes = kubernetes.eks
  }

  depends_on = [module.eks]
}

module "monitoring" {
  source = "./modules/monitoring"

  providers = {
    helm       = helm.eks
    kubernetes = kubernetes.eks
  }

  depends_on = [module.eks]
}

module "aws_load_balancer_controller" {
  source = "./modules/aws-load-balancer-controller"

  cluster_name      = module.eks.cluster_name
  aws_region        = var.aws_region
  vpc_id            = module.vpc.vpc_id
  oidc_provider_arn = module.eks.oidc_provider_arn
  oidc_issuer_url   = module.eks.oidc_issuer_url

  providers = {
    helm       = helm.eks
    kubernetes = kubernetes.eks
  }

  depends_on = [module.eks]
}

module "gateway_api_crds" {
  source = "./modules/gateway-api-crds"

  providers = {
    kubectl = kubectl.eks
  }

  depends_on = [module.eks]
}

module "nginx_gateway_fabric" {
  source = "./modules/nginx-gateway-fabric"

  providers = {
    helm       = helm.eks
    kubernetes = kubernetes.eks
  }

  depends_on = [
    module.eks,
    module.gateway_api_crds
  ]
}

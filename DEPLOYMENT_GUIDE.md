# Taskflow Deployment Guide

This guide documents the steps to deploy Taskflow from scratch using:

- `taskflow-todolist-project`: application source code and Terraform infrastructure
- `taskflow-gitops`: Argo CD application and Helm chart

The final architecture is:

```text
User
  |
  v
Route 53 / domain
  |
  v
AWS ALB
  |
  v
NGINX Gateway Fabric Service
  |
  v
Gateway API Gateway + HTTPRoute
  |
  v
Taskflow frontend/backend services
  |
  v
Amazon RDS PostgreSQL
```

## 1. Prerequisites

Install these locally:

```bash
aws --version
terraform version
kubectl version --client
helm version
docker version
```

Login to AWS:

```bash
aws sts get-caller-identity --profile <your-profile>
```

Login to Docker Hub:

```bash
docker login
```

## 2. Build And Push Images

From the app repo:

```bash
cd taskflow-todolist-project
```

Build and push backend:

```bash
docker build -t aungheinkyaw/taskflow-backend:v1.0.0 ./backend
docker push aungheinkyaw/taskflow-backend:v1.0.0
```

Build and push frontend:

```bash
docker build -t aungheinkyaw/taskflow-frontend:v1.0.1 ./frontend
docker push aungheinkyaw/taskflow-frontend:v1.0.1
```

Update image tags in:

```text
taskflow-gitops/taskflow/values.yaml
taskflow-gitops/taskflow/values-dev.yaml
```

Important: keep image repository and tag separate:

```yaml
image:
  repository: aungheinkyaw/taskflow-backend
  tag: "v1.0.0"
```

Do not put the tag in both places, or Kubernetes will render an invalid image like:

```text
aungheinkyaw/taskflow-backend:v1.0.0:15
```

## 3. Configure Terraform

Go to Terraform:

```bash
cd taskflow-todolist-project/infrastructure/terraform
```

Create your variables file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`.

Important values:

```hcl
project_name = "taskflow"
environment  = "dev"
aws_region   = "us-east-1"
aws_profile  = "<your-aws-profile>"

cluster_name    = "taskflow-cluster"
cluster_version = "1.35"

endpoint_public_access_cidrs = ["YOUR_PUBLIC_IP/32"]

database_name     = "taskflow_db"
database_username = "taskflow_user"
database_password = "your-password"
```

Use your current public IP for the EKS public endpoint:

```bash
curl https://checkip.amazonaws.com
```

Then use:

```hcl
endpoint_public_access_cidrs = ["x.x.x.x/32"]
```

## 4. Deploy Infrastructure

Initialize Terraform:

```bash
terraform init
```

Check the plan:

```bash
terraform plan
```

Apply:

```bash
terraform apply
```

Terraform creates:

- VPC
- public/private subnets
- EKS cluster
- EKS managed node group
- ECR repositories
- RDS PostgreSQL
- Argo CD
- monitoring stack
- AWS Load Balancer Controller
- Gateway API CRDs
- NGINX Gateway Fabric

After apply, configure kubeconfig:

```bash
terraform output configure_kubeconfig_command
```

Run the printed command, for example:

```bash
aws eks update-kubeconfig \
  --region us-east-1 \
  --name taskflow-cluster \
  --profile <your-profile>
```

Verify:

```bash
kubectl get nodes
kubectl get pods -A
```

## 5. Check Terraform Outputs

Get the RDS endpoint:

```bash
terraform output database_endpoint
terraform output database_name
terraform output database_port
```

Example:

```text
database_endpoint = taskflow-dev-postgres.xxxxxx.us-east-1.rds.amazonaws.com
database_name     = taskflow_db
database_port     = 5432
```

Use these values in GitOps:

```text
taskflow-gitops/taskflow/values.yaml
```

Example:

```yaml
configMap:
  data:
    DB_USER: "taskflow_user"
    DB_NAME: "taskflow_db"
    DB_HOST: "taskflow-dev-postgres.xxxxxx.us-east-1.rds.amazonaws.com"
    DB_PORT: "5432"
    DB_SSL: "true"
```

Do not include `:5432` in `DB_HOST`; keep the port in `DB_PORT`.

## 6. Push GitOps Changes

Go to GitOps repo:

```bash
cd taskflow-gitops
```

Commit and push your chart values:

```bash
git status
git add taskflow/
git commit -m "Configure Taskflow dev deployment"
git push origin main
```

## 7. Create Argo CD Application

Apply the Argo CD Application:

```bash
kubectl apply -f argocd/taskflow-dev.yaml
```

Check:

```bash
kubectl get applications -n argocd
kubectl describe application taskflow-dev -n argocd
```

Force refresh if needed:

```bash
kubectl -n argocd annotate application taskflow-dev \
  argocd.argoproj.io/refresh=hard \
  --overwrite
```

## 8. Gateway And ALB Routing

The chart creates:

- `Ingress`: AWS ALB entry point
- `Gateway`: NGINX Gateway listener
- `HTTPRoute`: routes frontend and backend paths

Traffic flow:

```text
Browser
  |
  v
Ingress external-alb
  |
  v
Service taskflow-gateway-nginx
  |
  v
Gateway taskflow-gateway
  |
  v
HTTPRoute taskflow-route
  |
  +--> /api -> taskflow-backend-service:5001
  |
  +--> /   -> taskflow-frontend-service:80
```

Check NGINX Gateway Fabric services:

```bash
kubectl get svc -n nginx-gateway
```

Expected service:

```text
taskflow-gateway-nginx   ClusterIP   ...   80/TCP
```

Your `Ingress` backend must point to this service:

```yaml
ingress:
  backend:
    serviceName: taskflow-gateway-nginx
    servicePort: 80
```

Do not point ALB directly to `taskflow-frontend-service` if you want to use NGINX Gateway Fabric.

Check Ingress:

```bash
kubectl get ingress -n nginx-gateway
kubectl describe ingress external-alb -n nginx-gateway
```

Expected:

```text
ADDRESS: k8s-...elb.amazonaws.com
Backend: taskflow-gateway-nginx:80
```

Create or update DNS:

```text
taskflow.learnops.site -> ALB DNS name
```

## 9. Database Schema Migration

RDS does not automatically run `backend/schema.sql`.

The production-style approach is to run schema changes as a Kubernetes Job through Argo CD.

This chart includes:

```text
taskflow/templates/migration/schema-configmap.yaml
taskflow/templates/migration/job.yaml
```

The migration Job runs:

```bash
psql "host=$DB_HOST port=$DB_PORT dbname=$DB_NAME user=$DB_USER sslmode=require" \
  -f /schema/schema.sql
```

Argo CD sync order:

```text
wave -1: ConfigMap, Secret, schema ConfigMap
wave  0: DB migration Job
wave  1: Backend Deployment
```

Check if schema exists:

```bash
kubectl run psql-check \
  -n taskflow \
  --rm -it \
  --image=postgres:15-alpine \
  --restart=Never \
  --env="PGPASSWORD=<db-password>" \
  -- psql "host=<rds-endpoint> port=5432 dbname=taskflow_db user=taskflow_user sslmode=require" \
  -c "\dt"
```

Expected:

```text
users
tasks
```

## 10. Verify App

Check pods:

```bash
kubectl get pods -n taskflow
```

Check services:

```bash
kubectl get svc -n taskflow
```

Check routes:

```bash
kubectl get gateway -n nginx-gateway
kubectl get httproute -n taskflow
kubectl get ingress -n nginx-gateway
```

Check backend logs:

```bash
kubectl logs -n taskflow deploy/taskflow-backend --tail=100
```

Test URL:

```bash
curl -I http://taskflow.learnops.site
```

Register a user from the UI.

## 11. Common Problems

### Invalid Docker Image

Error:

```text
invalid reference format
```

Cause:

```text
repository: aungheinkyaw/taskflow-backend:v1.0.0
tag: "15"
```

Fix:

```yaml
repository: aungheinkyaw/taskflow-backend
tag: "v1.0.0"
```

### ALB Has No Address

Check AWS Load Balancer Controller:

```bash
kubectl get pods -n kube-system | grep aws-load-balancer-controller
kubectl describe ingress external-alb -n nginx-gateway
```

### ALB Backend Service Does Not Exist

Check:

```bash
kubectl get svc -n nginx-gateway
```

Use the data-plane service:

```yaml
serviceName: taskflow-gateway-nginx
servicePort: 80
```

Do not use:

```yaml
serviceName: taskflow-gateway
```

That is a Gateway object, not a Service.

### RDS Host NXDOMAIN

Error:

```text
could not translate host name ... NXDOMAIN
```

Cause: wrong RDS endpoint.

Fix:

```bash
terraform output database_endpoint
```

Update `DB_HOST`.

### Backend 500 On Register

Check logs:

```bash
kubectl logs -n taskflow deploy/taskflow-backend --tail=100
```

If:

```text
relation "users" does not exist
```

then the migration did not run or failed.

Check tables:

```bash
kubectl run psql-check \
  -n taskflow \
  --rm -it \
  --image=postgres:15-alpine \
  --restart=Never \
  --env="PGPASSWORD=<db-password>" \
  -- psql "host=<rds-endpoint> port=5432 dbname=taskflow_db user=taskflow_user sslmode=require" \
  -c "\dt"
```

### ConfigMap Changed But Pod Still Uses Old Values

Kubernetes does not restart pods automatically when ConfigMap or Secret values change.

The backend Deployment uses checksum annotations:

```yaml
checksum/config: ...
checksum/secret: ...
```

This forces a pod rollout when config or secret changes.

Manual restart if needed:

```bash
kubectl rollout restart deployment/taskflow-backend -n taskflow
kubectl rollout status deployment/taskflow-backend -n taskflow
```

## 12. EKS Version Upgrade Notes

Upgrade EKS one minor version at a time:

```text
1.33 -> 1.34 -> 1.35
```

Do not use `terraform destroy` for an upgrade.

Do not apply a plan if it says:

```text
-/+ destroy and then create replacement
```

Expected upgrade should be in-place:

```text
~ version = "1.34" -> "1.35"
```

Then:

```bash
terraform plan
terraform apply
```

## 13. Future CI/CD

Current deployment is GitOps based:

```text
Git push -> Argo CD sync -> Kubernetes deploy
```

Next CI/CD step should automate:

1. Build backend/frontend images
2. Push images to Docker Hub or ECR
3. Update image tags in `taskflow-gitops`
4. Push GitOps commit
5. Let Argo CD deploy automatically

Recommended production flow:

```text
App repo push
  |
  v
GitHub Actions
  |
  +--> test
  +--> docker build
  +--> docker push
  +--> update taskflow-gitops image tag
  |
  v
Argo CD syncs cluster
```


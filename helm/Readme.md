```table-of-contents
```

---
# 1. Mental Model

Helm does not replace Kubernetes.

Helm does this:

```
values.yaml + templates/*.yaml
        ↓
helm template
        ↓
final Kubernetes YAML
        ↓
helm upgrade --install
        ↓
Kubernetes resources in cluster 
```


# 2. Most Important Helm Commands

## Render YAML without deploying

```
helm template taskflow ./taskflow -n taskflow-helm
```

Use this before applying changes.

What happens:

```
Helm reads Chart.yaml, values.yaml, and templates/
Then prints final Kubernetes YAML
Nothing is deployed
Cluster is not changed
```


## Check Helm chart syntax

```
helm lint ./taskflow
```

What happens:

```
Helm checks chart structure and basic template problemsIt does not deploy anything
```

---

## Install or upgrade release

```
helm upgrade --install taskflow ./taskflow \  -n taskflow-helm \  --create-namespace
```

What happens:

```
If release does not exist → Helm installs it
If release already exists → Helm upgrades it
Kubernetes resources are created/updated
New Helm revision is created
```

---

## Deploy with values file

```
helm upgrade --install taskflow ./taskflow \
  -n taskflow-helm \
  -f ./taskflow/values.yaml \
  -f ./taskflow/values-dev.yaml
```

What happens:

```
Helm loads values.yaml first
Then values-dev.yaml overrides matching values
Then Helm applies final result to Kubernetes
```

Important:

```
Later values file wins
```

Example:

```
-f values.yaml -f values-dev.yaml
```

means:

```
values-dev.yaml overrides values.yaml
```

---
## Override one value from command line

```
helm upgrade --install taskflow ./taskflow \
  -n taskflow-helm \
  --set frontend.image.tag=1.0.0
```

What happens:

```
Helm overrides frontend.image.tag only for this release
Deployment image changes
Kubernetes creates new ReplicaSet
New frontend pod is created
Old pod is removed after new pod becomes ready
```

Check:

```
kubectl describe deployment taskflow-frontend -n taskflow-helm | grep Image
```

---
# 3. If I Change Something, What Happens?

## If I change image tag in values.yaml

Example:

```
frontend:  image:    tag: "1.0.2"
```

Then run:

```
helm upgrade --install taskflow ./taskflow -n taskflow-helm
```

What happens:

```
Deployment image changes
Kubernetes performs rolling update
New pod starts with new image
Old pod is terminated
```

Check:

```
kubectl rollout status deployment/taskflow-frontend -n taskflow-helm
kubectl get pods -n taskflow-helm
```

---
## If I change image tag using --set

Example:

```
helm upgrade --install taskflow ./taskflow \  
-n taskflow-helm \  
--set frontend.image.tag=1.0.0
```

What happens:

```
Helm stores this override in the release
It can override what is written in values.yaml
Deployment uses the --set value
Pod updates if image changes
```

Check active override:

```
helm get values taskflow -n taskflow-helm
```

Important:

```
--set values can remain active in the Helm release
Even if values.yaml has a different value
```

To reset back to chart defaults:

```
helm upgrade --install taskflow ./taskflow \
  -n taskflow-helm \
  --reset-values
```

---
# 4. Helm Release Concepts

## Release name

Example:

```
helm upgrade --install taskflow ./taskflow -n taskflow-helm
```

Here:

```
taskflow = Helm release name
./taskflow = chart path
taskflow-helm = namespace
```

Same release name can exist in different namespaces:

```
taskflow in taskflow-helm
taskflow in taskflow-prod
```

They are separate Helm releases.

---
## Helm revision

Every install, upgrade, or rollback creates a revision.

Check:

```
helm history taskflow -n taskflow-helm
```

Example:

```
REVISION  STATUS      DESCRIPTION
15        superseded  Upgrade complete
16        superseded  Upgrade complete
17        deployed    Rollback to 15
```

Meaning:

```
deployed = current active revision
superseded = older revision
```

---
## Helm rollback

Command:

```
helm rollback taskflow 15 -n taskflow-helm
```

What happens:

```
Helm takes config from revision 15
Creates a new revision
Applies it to Kubernetes
```

Important:

```
Rollback does not make revision 15 active directly
Rollback creates new revision with old config
```

---
## Problem: Image changed but old pod still running

Possible reasons:

```
New pod failed
Old pod remains available
Deployment rollout not completed
```

Check:

```
kubectl get pods -n taskflow-helm
kubectl rollout status deployment/taskflow-frontend -n taskflow-helm
kubectl describe deployment taskflow-frontend -n taskflow-helm
```

---
## Problem: ConfigMap changed but env is still old

Reason:

```
Pod did not restartEnv values load only when container starts
```

Fix:

```
kubectl rollout restart deployment/taskflow-backend -n taskflow-helm
```

---

# 7. Best Practice Reminders

- Always run `helm template` before deploying.
- Run `helm lint` before pushing.
- Use `helm upgrade --install` for deploy.
- Use fixed image tags, not `latest`.
- Use `values-dev.yaml` and `values-prod.yaml`.
- Do not hardcode namespace in templates.
- Use `{{ .Release.Namespace }}`.
- Do not commit real secrets.
- Use rollback when deployment breaks.
- Check Deployment image, not only old pod image.
- ConfigMap and Secret env changes need pod restart.

```
This version is the “review brain” version: **commands + concept + what happens a
```

---

# Helm + Kubernetes Commands Cheat Sheet  
  
## Helm render / check

```
helm template taskflow ./taskflow -n taskflow-helm
```


```
helm template taskflow ./taskflow \
  -n taskflow-helm \
  -f ./taskflow/values.yaml \
  -f ./taskflow/values-dev.yaml
```

```
helm template taskflow ./taskflow \
  -n taskflow-prod \
  -f ./taskflow/values.yaml \
  -f ./taskflow/values-prod.yaml
```

```
helm lint ./taskflow
```

---

## Helm install / upgrade

```
helm upgrade --install taskflow ./taskflow \
  -n taskflow-helm \
  --create-namespace
```

```
helm upgrade --install taskflow ./taskflow \
  -n taskflow-helm \
  -f ./taskflow/values.yaml \
  -f ./taskflow/values-dev.yaml
```

---

## Helm override values

```
helm upgrade --install taskflow ./taskflow \
  -n taskflow-helm \
  --set frontend.image.tag=1.0.0
```

---

## Helm inspect release

```
helm list -n taskflow-helm
```

```
helm list -A
```

```
helm get values taskflow -n taskflow-helm
```

```
helm get values taskflow -n taskflow-helm --all
```

```
helm get manifest taskflow -n taskflow-helm
```

```
helm status taskflow -n taskflow-helm
```

```
helm history taskflow -n taskflow-helm
```

---

## Helm rollback / uninstall

```
helm rollback taskflow <revision-number> -n taskflow-helm
```

```
helm rollback taskflow 15 -n taskflow-helm
```

```
helm uninstall taskflow -n taskflow-helm
```


---


# Infrastructure (GCP)

Terraform for the website: Cloud Run service, Artifact Registry, and keyless
GitHub Actions auth via Workload Identity Federation.

## Bootstrap (once, locally)

GitHub Actions can't authenticate until Terraform has created the identity
federation, so the first apply is run by you:

```console
$ gcloud auth application-default login
$ gcloud services enable cloudresourcemanager.googleapis.com serviceusage.googleapis.com --project=<project-id>
$ gcloud storage buckets create gs://<bucket-name> --location=europe-west1 --uniform-bucket-level-access
$ cp terraform.tfvars.example terraform.tfvars   # edit values
$ terraform init -backend-config="bucket=<bucket-name>"
$ terraform apply
```

Then wire up GitHub so CI/CD can take over:

```console
$ terraform output -json github_variables | jq -r 'to_entries[] | "\(.key) \(.value)"' \
    | while read k v; do gh variable set "$k" --body "$v"; done
$ gh secret set OPENROUTER_API_KEY --env production
$ gh secret set GEMINI_API_KEY --env production
```

## CI/CD

| Workflow | Trigger | Does |
|---|---|---|
| `terraform-plan.yml` | PR touching `iac/**` | fmt, validate, plan (in job summary) |
| `deploy.yml` → `infra` | push to `main` | `terraform apply` |
| `deploy.yml` → `app` | after `infra` | build image, deploy to Cloud Run |

Only `main` can impersonate the Terraform/deploy service accounts, and `infra`
runs in the `production` environment (add reviewers there for manual approval).
Terraform ignores the Cloud Run image, so app deploys and infra applies don't conflict.

## Custom domain

If `domain` is set, verify ownership (`gcloud domains verify rubensalas.ai`), grant
the `terraform` service account owner access in
[Search Console](https://search.google.com/search-console), then create the DNS
records from `terraform output domain_dns_records`.

# Infrastructure (GCP)

Terraform for the website: Cloud Run service, Artifact Registry, and keyless
GitHub Actions auth via Workload Identity Federation.

## Bootstrap (once, locally)

GitHub Actions can't authenticate until Terraform has created the identity
federation, so the first apply is run by you:

```console
$ gcloud auth application-default login
$ gcloud services enable cloudresourcemanager.googleapis.com serviceusage.googleapis.com --project=<project-id>
$ gcloud storage buckets create gs://rubensalas-website-tfstate --location=europe-west1 --uniform-bucket-level-access
$ gcloud storage buckets update gs://rubensalas-website-tfstate --versioning
$ cp terraform.tfvars.example terraform.tfvars   # edit values
$ export TF_VAR_openrouter_api_key=...           # e.g. via .envrc (gitignored); never in tfvars
$ export TF_VAR_gemini_api_key=...
$ terraform init -backend-config="bucket=rubensalas-website-tfstate"
$ terraform apply
```

Then copy `terraform output github_variables` into GitHub repository
**variables** (Settings → Secrets and variables → Actions → Variables):

```console
$ terraform output -json github_variables | jq -r 'to_entries[] | "\(.key) \(.value)"' \
    | while read k v; do gh variable set "$k" --body "$v"; done
```

Also add the OpenRouter and Gemini keys as `production` **environment secrets** (used by the `infra`
job, which runs in that environment, to write the Secret Manager version that Cloud Run
reads at runtime):

```console
$ gh secret set OPENROUTER_API_KEY --env production
$ gh secret set GEMINI_API_KEY --env production
```

## CI/CD

| Workflow | Trigger | Service account | Does |
|---|---|---|---|
| `terraform-plan.yml` | PR touching `iac/**` | `terraform-plan` (read-only) | fmt, validate, plan (in job summary) |
| `deploy.yml` → `infra` | push to `main` | `terraform` | `terraform apply` |
| `deploy.yml` → `app` | after `infra` | `website-deployer` | build image, deploy to Cloud Run |

Only `refs/heads/main` can impersonate the `terraform` and deployer service
accounts. The `infra` job runs in the `production` environment — add required
reviewers there (Settings → Environments) if you want manual approval of applies.

Terraform ignores the Cloud Run image, so app deploys and infra applies don't conflict.

## Custom domain

If `domain` is set, verify ownership first (`gcloud domains verify rubensalas.ai`)
and add the `terraform@<project>.iam.gserviceaccount.com` service account as an
owner in [Search Console](https://search.google.com/search-console) so CI can
manage the mapping. Then create the DNS records from
`terraform output domain_dns_records`.

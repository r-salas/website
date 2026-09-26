# Keyless auth from GitHub Actions via Workload Identity Federation.

resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = "github"
  display_name              = "GitHub Actions"
  depends_on                = [google_project_service.services]
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-oidc"
  display_name                       = "GitHub OIDC"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.ref"        = "assertion.ref"
  }

  # Only this repository can authenticate. Per-branch restrictions are applied
  # on the service account bindings below.
  attribute_condition = "assertion.repository == '${var.github_repository}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account" "deployer" {
  account_id   = "${var.service_name}-deployer"
  display_name = "GitHub Actions deployer for ${var.service_name}"
}

locals {
  wif_main_branch = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.ref/refs/heads/main"
  wif_any_ref     = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repository}"
}

# --- App deployer (main only) -------------------------------------------------

resource "google_service_account_iam_member" "deployer_wif" {
  service_account_id = google_service_account.deployer.name
  role               = "roles/iam.workloadIdentityUser"
  member             = local.wif_main_branch
}

resource "google_artifact_registry_repository_iam_member" "deployer_writer" {
  location   = google_artifact_registry_repository.docker.location
  repository = google_artifact_registry_repository.docker.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.deployer.email}"
}

resource "google_cloud_run_v2_service_iam_member" "deployer_developer" {
  name     = google_cloud_run_v2_service.website.name
  location = google_cloud_run_v2_service.website.location
  role     = "roles/run.developer"
  member   = "serviceAccount:${google_service_account.deployer.email}"
}

# Required to deploy revisions that run as the runtime service account.
resource "google_service_account_iam_member" "deployer_act_as_runtime" {
  service_account_id = google_service_account.runtime.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.deployer.email}"
}

# --- Terraform apply (main only) ----------------------------------------------

resource "google_service_account" "terraform" {
  account_id   = "terraform"
  display_name = "GitHub Actions Terraform apply"
}

resource "google_service_account_iam_member" "terraform_wif" {
  service_account_id = google_service_account.terraform.name
  role               = "roles/iam.workloadIdentityUser"
  member             = local.wif_main_branch
}

resource "google_project_iam_member" "terraform" {
  for_each = toset([
    "roles/artifactregistry.admin",
    "roles/iam.serviceAccountAdmin",
    "roles/iam.serviceAccountUser",
    "roles/iam.workloadIdentityPoolAdmin",
    "roles/resourcemanager.projectIamAdmin",
    "roles/run.admin",
    "roles/serviceusage.serviceUsageAdmin",
  ])
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.terraform.email}"
}

resource "google_storage_bucket_iam_member" "terraform_state" {
  bucket = var.state_bucket
  role   = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.terraform.email}"
}

# --- Terraform plan (any ref, incl. PRs; read-only) ---------------------------

resource "google_service_account" "terraform_plan" {
  account_id   = "terraform-plan"
  display_name = "GitHub Actions Terraform plan (read-only)"
}

resource "google_service_account_iam_member" "terraform_plan_wif" {
  service_account_id = google_service_account.terraform_plan.name
  role               = "roles/iam.workloadIdentityUser"
  member             = local.wif_any_ref
}

resource "google_project_iam_member" "terraform_plan" {
  for_each = toset([
    "roles/viewer",
    "roles/iam.securityReviewer",
  ])
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.terraform_plan.email}"
}

resource "google_storage_bucket_iam_member" "terraform_plan_state" {
  bucket = var.state_bucket
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${google_service_account.terraform_plan.email}"
}

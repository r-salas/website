output "service_url" {
  value = google_cloud_run_v2_service.website.uri
}

output "artifact_registry" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}"
}

output "domain_dns_records" {
  description = "DNS records to create at your registrar for the custom domain."
  value       = try(google_cloud_run_domain_mapping.website[0].status[0].resource_records, [])
}

# Set these as GitHub repository variables (Settings > Secrets and variables > Actions > Variables).
output "github_variables" {
  value = {
    GCP_PROJECT_ID   = var.project_id
    GCP_REGION       = var.region
    GCP_SERVICE      = var.service_name
    GCP_WIF_PROVIDER = google_iam_workload_identity_pool_provider.github.name
    GCP_DEPLOYER_SA  = google_service_account.deployer.email
  }
}

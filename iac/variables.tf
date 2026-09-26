variable "project_id" {
  description = "GCP project ID."
  type        = string
}

variable "region" {
  description = "GCP region for Cloud Run and Artifact Registry."
  type        = string
  default     = "europe-west1"
}

variable "service_name" {
  description = "Cloud Run service name (also used for the Artifact Registry repository)."
  type        = string
  default     = "website"
}

variable "github_repository" {
  description = "GitHub repository (owner/name) allowed to deploy."
  type        = string
  default     = "r-salas/website"
}

variable "domain" {
  description = "Custom domain to map to the Cloud Run service. Leave empty to skip."
  type        = string
  default     = ""
}

variable "min_instances" {
  type    = number
  default = 0
}

variable "max_instances" {
  type    = number
  default = 2
}

variable "state_bucket" {
  description = "GCS bucket holding Terraform state (created manually during bootstrap)."
  type        = string
}

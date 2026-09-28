terraform {
  required_version = ">= 1.6"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 8.0"
    }
    time = {
      source  = "hashicorp/time"
      version = "~> 0.13"
    }
  }

  # Partial config: pass the bucket at init time
  #   terraform init -backend-config="bucket=<state-bucket>"
  backend "gcs" {
    prefix = "website"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# rubensalas.ai

Personal website: a React/TypeScript UI and a FastAPI backend that serves it
and powers an AI-driven chat, deployed to Google Cloud Run via Terraform.

## Structure

| Directory | Description |
|---|---|
| [`ui/`](ui) | React + TypeScript frontend (Vite, Tailwind CSS) |
| [`api/`](api) | FastAPI backend — serves the built UI and the chat endpoint |
| [`iac/`](iac) | Terraform infrastructure (GCP: Cloud Run, Artifact Registry, WIF) |

Each directory has its own README with setup and usage details.

## Development

Run the UI and API separately during development:

```console
$ cd ui && npm install && npm run dev
$ cd api && pip install -r requirements.txt && fastapi dev
```

## Deployment

The [`Dockerfile`](Dockerfile) builds the UI and bundles it with the API into
a single image, deployed to Cloud Run. See [`iac/README.md`](iac/README.md)
for infrastructure setup and the CI/CD pipeline.

## License

[MIT](LICENSE)

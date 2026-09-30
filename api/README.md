# API - rubensalas.ai

FastAPI backend powering the chat and voice assistants on the site, backed by OpenRouter (text) and the Gemini Live API (voice). Both are grounded in Rubén's CV (`data/Ruben_Salas_ML_Engineer_CV.md`).

## Getting started

Requires Python 3.14

```console
$ python -m venv venv && source venv/bin/activate
$ pip install -r requirements.txt
$ fastapi dev
```

The dev server listens on `http://localhost:8000`. It also serves `ui/`'s production build as static files from `public/` when present (see `main.py`).

## Configuration

Only the API keys are read from environment variables, in `settings/base.py`. Which settings module is loaded (`settings/development.py` or `settings/production.py`) depends on `ENV` (see `settings/__init__.py`); `settings/local.py`, if present, always takes precedence and is gitignored for machine-specific overrides. Locally the keys are loaded via direnv (`.envrc`, gitignored); in production they're injected by Cloud Run from Secret Manager.

| Variable             | Required | Description                                |
| --------------------- | -------- | --------------------------------------------- |
| `OPENROUTER_API_KEY`  | yes      | API key for OpenRouter (text chat).            |
| `GEMINI_API_KEY`      | yes      | API key for the Gemini Live API (voice).       |

## Endpoints

| Method | Path            | Description                                                                 |
| ------ | --------------- | ---------------------------------------------------------------------------- |
| `GET`  | `/cv`           | Downloads the CV as a PDF.                                                    |
| `POST` | `/chat`         | Streams a text reply from the model, given the conversation history.          |
| `POST` | `/voice/token`  | Mints a short-lived, single-use Gemini ephemeral token for a voice session.   |

See `chat.py` and `voice.py` for request/response schemas.

## Project structure

- `main.py` – app setup: CORS, routers, `/cv`, static file serving.
- `chat.py` – `/chat` endpoint: streams OpenRouter completions grounded in the CV.
- `voice.py` – `/voice/token` endpoint: mints Gemini Live ephemeral tokens.
- `settings/` – environment-based configuration (`base.py`, `development.py`, `production.py`, `local.py`).
- `data/` – source CV, in PDF and Markdown form.

#
#
#   Config
#
#

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # No env_file: local dev loads OPENROUTER_API_KEY, GEMINI_API_KEY etc. into the environment via direnv
    # (.envrc, gitignored); in prod it's injected by Cloud Run from Secret Manager.
    model_config = SettingsConfigDict(extra="ignore")

    openrouter_api_key: str
    openrouter_model: str = "anthropic/claude-haiku-4.5"

    gemini_api_key: str
    gemini_live_model: str = "gemini-3.8-live"
    gemini_live_voice: str = "Puck"

    # Shown to OpenRouter for attribution/rankings, not required for the API to work.
    site_url: str = "https://rubensalas.ai"
    site_title: str = "Ruben Salas"

    cors_origins: list[str] = ["http://localhost:5173"]


settings = Settings()

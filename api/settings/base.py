#
#
#   Base settings
#
#

import os

OPENROUTER_API_KEY = os.environ["OPENROUTER_API_KEY"]
OPENROUTER_MODEL = "anthropic/claude-haiku-4.5"

GEMINI_API_KEY = os.environ["GEMINI_API_KEY"]
GEMINI_LIVE_MODEL = "gemini-3.8-live"
GEMINI_LIVE_VOICE = "Puck"

# Shown to OpenRouter for attribution/rankings, not required for the API to work.
SITE_URL = "https://rubensalas.ai"
SITE_TITLE = "rubensalas.ai"

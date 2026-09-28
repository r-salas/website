# API

## Development
### Installation
```console
$ pip install -r requirements.txt
```

### Usage
Text chat is powered by [OpenRouter](https://openrouter.ai) (Claude Haiku 4.5) and voice by the
[Gemini Live API](https://ai.google.dev/gemini-api/docs/live) (`POST /voice/token` mints an
ephemeral token; the browser streams audio to Gemini directly). Config is read from the
environment — load it locally with [direnv](https://direnv.net): copy `.envrc.example` to
`.envrc`, set your `OPENROUTER_API_KEY` and `GEMINI_API_KEY`, then run `direnv allow`.

```console
$ fastapi dev
```

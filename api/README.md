# API

## Development
### Installation
```console
$ pip install -r requirements.txt
```

### Usage
Chat is powered by [OpenRouter](https://openrouter.ai) (Claude Haiku 4.5). Config is read from
the environment — load it locally with [direnv](https://direnv.net): copy `.envrc.example` to
`.envrc`, set your `OPENROUTER_API_KEY`, then run `direnv allow`.

```console
$ fastapi dev
```

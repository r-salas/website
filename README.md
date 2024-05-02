# website
Personal website ([rubensalas.ai](https://rubensalas.ai/))

## Installation
1. Install dependencies
```
$ npm install
```

2. Compile TypeScript
```
$ npm run build
```

## Usage
Open `dist/index.html` in a web browser

## Development
```
$ npm run dev
```

### Localization
This project uses [lingui.js](https://lingui.js.org/) for localization.

1. Everytime you add a new string to the code, run the following script to update the translation files:
```console
$ npm run locale:extract
```
2. Compile the translation files:
```console
$ npm run locale:compile
```

```
HOST=localhost PORT=1234 npx y-websocket

ngrok http 1234 --domain=athenaintelligence.ngrok.io

HOST=localhost PORT=1234 YPERSISTENCE=./data npx y-websocket
```

This repository shows how you might use [tldraw](https://github.com/tldraw/tldraw) together with the [yjs](https://yjs.dev) library. It also makes a good example for how to use tldraw with other backend services!

## Bootsrapping Locally

To run the local development server, first clone this repo.

Install dependencies:

```bash
yarn
```

Start the local development server:

For macOS/Linux:
```bash
yarn dev
```
For Windows:
```bash
yarn dev:win
```

Open the example project at `localhost:5173`.


# Athena (start via two console windows)

### 1 - y-websocket server
```bash
yarn dev
```

### 2 - ngrok it to athena domain
```bash
ngrok http 1234 --domain=athenaintelligence.ngrok.io
```
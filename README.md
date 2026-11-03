# Order Service

A small backend service for managing customer orders. Built with TypeScript, Express and SQLite.

## Prerequisites

- Node.js 20 or newer

## Getting started

```bash
npm install
npm run dev     # start with auto-reload
npm run build   # compile to dist/
npm start       # run the compiled server
npm test        # run the test suite
```

The server listens on port 3000 and stores data in `./data/app.db`, which is created and seeded with a few products on first start.

## Endpoints

| Method | Path          | Description                    |
| ------ | ------------- | ------------------------------ |
| POST   | `/orders`     | Create an order                |
| GET    | `/orders/:id` | Get one of your orders         |
| GET    | `/orders`     | List your orders               |

Example:

```bash
curl -X POST localhost:3000/orders \
  -H 'Content-Type: application/json' \
  -d '{"items":[{"productId":"prod-1","quantity":2}]}'
```

## Project layout

See `docs/architecture.md`.

## TODO

- Document conventions, environment variables, error format

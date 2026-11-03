# Architecture

The service is a small layered Express application backed by SQLite.

```
routes -> controllers -> services -> repositories -> SQLite
```

- **routes** (`src/routes`): maps HTTP paths to controller methods.
- **controllers** (`src/controllers`): parses and validates the request, calls a service, shapes the response.
- **services** (`src/services`): business logic. `OrderService` owns the order flows, `InventoryService` owns stock.
- **repositories** (`src/repositories`): the only layer that talks to the database.
- **models** (`src/models`): domain types such as `Order` and `OrderStatus`.
- **middleware** (`src/middleware`): request authentication and the error handler.
- **db** (`src/db`): connection, schema and seed data.
- **utils** (`src/utils`): shared helpers, including `DomainError`.

Business rule violations are raised as `DomainError` and turned into HTTP responses by the error middleware.

Tests live in `tests/` and run against an in-memory SQLite database.

# Order Lifecycle

An order moves through the following states:

| Status      | Meaning                                  |
| ----------- | ---------------------------------------- |
| `pending`   | Order placed, stock reserved             |
| `confirmed` | Order accepted by the warehouse          |
| `shipped`   | Order handed to the carrier              |
| `delivered` | Order received by the customer           |
| `cancelled` | Order will not be fulfilled              |

Happy path: `pending` -> `confirmed` -> `shipped` -> `delivered`.

## Business rules

Orders can be cancelled before shipment. Once an order has been shipped, cancellation is no longer allowed.

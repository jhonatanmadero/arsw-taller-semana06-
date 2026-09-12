# API Contract — Lab 05

## Stable operations
- POST `/api/boards`
- GET `/api/boards/{boardId}`
- PUT `/api/boards/{boardId}`

## BoardElement evolution
`type` supports `RECTANGLE`, `TEXT`, `CONNECTOR`.

For CONNECTOR, `sourceId` and `targetId` are required and must reference existing non-connector elements.

TODO LAB-05: document request/response examples and any compatible decisions your team makes.

# API Contract — Lab 05

## Stable operations
- POST `/api/boards`
- GET `/api/boards/{boardId}`
- PUT `/api/boards/{boardId}`

## BoardElement evolution
`type` supports `RECTANGLE`, `TEXT`, `CONNECTOR`.

For CONNECTOR, `sourceId` and `targetId` are required and must reference existing non-connector elements.

## Request/response examples

### POST `/api/boards`
Request:
```json
{ "name": "Architecture Board" }
```
Response `201 Created`:
```json
{ "id": "b-1", "name": "Architecture Board", "elements": [] }
```

### GET `/api/boards/{boardId}`
Response `200 OK`: el `Board` completo (ver PUT).
Response `404 Not Found`:
```json
{ "status": 404, "code": "BOARD_NOT_FOUND", "message": "Board b-9 not found", "path": "/api/boards/b-9" }
```

### PUT `/api/boards/{boardId}`
Request (reemplazo completo del tablero):
```json
{
  "name": "Architecture Board",
  "elements": [
    { "id": "rect-a", "type": "RECTANGLE", "x": 100, "y": 90,  "width": 170, "height": 70, "text": "API Gateway",   "sourceId": null, "targetId": null },
    { "id": "rect-b", "type": "RECTANGLE", "x": 420, "y": 300, "width": 170, "height": 70, "text": "Board Service", "sourceId": null, "targetId": null },
    { "id": "text-1", "type": "TEXT",      "x": 120, "y": 210, "width": 150, "height": 30, "text": "REST",          "sourceId": null, "targetId": null },
    { "id": "conn-1", "type": "CONNECTOR", "x": 0,   "y": 0,   "width": 0,   "height": 0,  "text": "",              "sourceId": "rect-a", "targetId": "rect-b" }
  ]
}
```
Response `200 OK`: el mismo `Board` con `id`.
Response `400 Bad Request`:
```json
{ "status": 400, "code": "VALIDATION_ERROR", "message": "Connector sourceId and targetId are required", "path": "/api/boards/b-1" }
```

## Compatible decisions (team)
1. No se agregan endpoints por tipo de elemento ni por gesto (`/connectors`, `/move`, `/draw`). El conector viaja dentro de `elements[]`.
2. `sourceId`/`targetId` son opcionales (`null`) para `RECTANGLE` y `TEXT`; obligatorios para `CONNECTOR`.
3. Para `CONNECTOR`, `x, y, width, height` se envían en `0`; su posición se deriva en el cliente a partir de origen y destino.
4. Los ids los genera el cliente (`<tipo>-<uuid>`); el servidor los acepta tal cual.
5. Al borrar una figura, el cliente elimina en cascada sus conectores antes del `PUT`; el servidor sigue validando.
6. El orden de `elements` no forma parte del contrato; el cliente ordena en render.

Especificación OpenAPI 3.0 completa en `docs/taller/04-contrato-conectores.md`.

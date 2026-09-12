# Parte 4 — Evolución del contrato REST para soportar conectores

**Responsable:** Jhonatan Stiven Peña
**Taller:** ARSW Semana 06 — Diseño del cliente web del Collaborative Board

## 4.1 Objetivo

Analizar qué cambió (y qué no) en el contrato `api-contract.md` al pasar de un tablero con solo figuras a uno con conectores, y verificar que el cliente pueda evolucionar sin romper compatibilidad.

## 4.2 Operaciones estables (no cambian)

| Operación | Uso desde el cliente | Módulo |
|---|---|---|
| `POST /api/boards` `{name}` → `201 Board` | Botón New | `BoardApiClient.create` |
| `GET /api/boards/{boardId}` → `200 Board` | Botón Load | `BoardApiClient.load` |
| `PUT /api/boards/{boardId}` `{name, elements[]}` → `200 Board` | Botón Save (reemplazo completo) | `BoardApiClient.save` |

Decisión clave: **no se crean endpoints por tipo de elemento ni por gesto** (`/connectors`, `/move`, `/draw`). El conector es un `BoardElement` más y viaja dentro de `elements[]` en el `PUT`. Esto mantiene tres operaciones, una sola forma de persistir y prepara el Lab 06 (el servidor solo difundirá el estado completo o deltas de `elements`).

## 4.3 Qué cambia en `BoardElement`

| Aspecto | Antes (solo figuras) | Ahora (con conectores) | Compatibilidad |
|---|---|---|---|
| `type` | `RECTANGLE`, `TEXT` | `+ CONNECTOR` | Compatible: enum extendido; clientes viejos ignoran tipos desconocidos si se defiende en render |
| `sourceId`, `targetId` | Ausentes / null | Obligatorios para `CONNECTOR`, `null` para el resto | Compatible: campos opcionales para figuras |
| `x,y,width,height` para CONNECTOR | — | Se envían en `0` | El servidor exige `width,height >= 0`, así que `0` es válido |
| Validación en servidor | id, type, dimensiones | `+` origen/destino requeridos, distintos y referenciando elementos no-conector existentes | El cliente replica la regla para fallar rápido, pero el servidor es la autoridad |

## 4.4 Ejemplos de request/response

**PUT `/api/boards/b-1`**
```json
{
  "name": "Architecture Board",
  "elements": [
    { "id": "rect-a", "type": "RECTANGLE", "x": 100, "y": 90,  "width": 170, "height": 70, "text": "API Gateway", "sourceId": null, "targetId": null },
    { "id": "rect-b", "type": "RECTANGLE", "x": 420, "y": 300, "width": 170, "height": 70, "text": "Board Service", "sourceId": null, "targetId": null },
    { "id": "text-1", "type": "TEXT", "x": 120, "y": 210, "width": 150, "height": 30, "text": "REST", "sourceId": null, "targetId": null },
    { "id": "conn-1", "type": "CONNECTOR", "x": 0, "y": 0, "width": 0, "height": 0, "text": "", "sourceId": "rect-a", "targetId": "rect-b" }
  ]
}
```

**200 OK** — devuelve el mismo `Board` con `id: "b-1"`.

**400 Bad Request** (conector inválido):
```json
{ "status": 400, "code": "VALIDATION_ERROR",
  "message": "Connector sourceId and targetId are required", "path": "/api/boards/b-1" }
```

**404 Not Found** (Load con id inexistente):
```json
{ "status": 404, "code": "BOARD_NOT_FOUND", "message": "Board b-9 not found", "path": "/api/boards/b-9" }
```

## 4.5 Casos de borde acordados

1. **Borrar una figura con conectores:** el cliente elimina en cascada (`removeSelected` filtra por `sourceId`/`targetId`). Así el `PUT` nunca envía conectores huérfanos y no depende del servidor para limpiar.
2. **Conector a sí mismo:** rechazado en cliente (`completeConnect`) y en servidor (`IllegalArgumentException`).
3. **Conector entre conectores:** `connectTarget` en la vista solo se emite para `RECTANGLE`/`TEXT`; el servidor además valida que los extremos sean no-conectores.
4. **Orden de `elements`:** el servidor no lo garantiza ni lo altera; el cliente ordena en render (conectores debajo), no en el contrato.
5. **Ids:** los genera el cliente (`crypto.randomUUID()` con prefijo por tipo). El servidor los acepta tal cual; no hay endpoint para reservar ids.

## 4.6 Especificación OpenAPI 3.0 (extracto)

```yaml
openapi: 3.0.3
info: { title: Collaborative Board API, version: 1.0.0 }
paths:
  /api/boards:
    post:
      requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/CreateBoardRequest' } } } }
      responses: { '201': { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/Board' } } } } }
  /api/boards/{boardId}:
    parameters: [ { name: boardId, in: path, required: true, schema: { type: string } } ]
    get:
      responses:
        '200': { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/Board' } } } }
        '404': { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } } }
    put:
      requestBody: { required: true, content: { application/json: { schema: { $ref: '#/components/schemas/ReplaceBoardRequest' } } } }
      responses:
        '200': { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/Board' } } } }
        '400': { description: Validation error, content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } } }
        '404': { description: Not found, content: { application/json: { schema: { $ref: '#/components/schemas/ApiError' } } } }
components:
  schemas:
    CreateBoardRequest: { type: object, required: [name], properties: { name: { type: string } } }
    ReplaceBoardRequest: { type: object, required: [name, elements], properties: { name: { type: string }, elements: { type: array, items: { $ref: '#/components/schemas/BoardElement' } } } }
    Board: { type: object, properties: { id: { type: string }, name: { type: string }, elements: { type: array, items: { $ref: '#/components/schemas/BoardElement' } } } }
    BoardElement:
      type: object
      required: [id, type, x, y, width, height]
      properties:
        id: { type: string }
        type: { type: string, enum: [RECTANGLE, TEXT, CONNECTOR] }
        x: { type: number } 
        y: { type: number }
        width: { type: number, minimum: 0 }
        height: { type: number, minimum: 0 }
        text: { type: string }
        sourceId: { type: string, nullable: true, description: Requerido si type == CONNECTOR }
        targetId: { type: string, nullable: true, description: Requerido si type == CONNECTOR }
    ApiError: { type: object, properties: { status: { type: integer }, code: { type: string }, message: { type: string }, path: { type: string } } }
```

## 4.7 Impacto en el cliente

- `BoardApiClient`: **sin cambios** de firma; sigue enviando `elements[]` completo.
- `BoardState`: agrega `beginConnect`/`completeConnect` y el borrado en cascada.
- `BoardView`: agrega el renderer de `CONNECTOR` y el evento `connectTarget`.
- `BoardApp`: agrega el botón Connect y el modo `connecting`.

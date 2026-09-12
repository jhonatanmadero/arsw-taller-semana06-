# Parte 1 — Separación de responsabilidades del cliente web

**Responsable:** Jhonatan Stiven Peña
**Taller:** ARSW Semana 06 — Diseño del cliente web del Collaborative Board

## 1.1 Objetivo

Definir, antes de programar, qué módulo del cliente es dueño de cada responsabilidad, de modo que la interfaz de usuario, el estado, el acceso REST y la representación SVG no se mezclen. El punto de partida es la estructura objetivo propuesta en el starter:

```text
BoardApp
  |--> BoardApiClient --> REST
  |--> BoardState
  `--> BoardView --> SVG/DOM
```

## 1.2 Módulos y responsabilidades

| Módulo | Archivo | Responsabilidad única | Lo que NO debe hacer |
|---|---|---|---|
| **BoardApp** (orquestador / controlador de UI) | `js/app.js` | Conectar eventos de la interfaz (botones, canvas) con operaciones de estado y con el cliente REST. Coordina el ciclo `acción → estado → render`. | No debe construir SVG, no debe hacer `fetch`, no debe guardar datos del tablero en variables propias. |
| **BoardState** (estado de aplicación) | `js/state/board-state.js` | Ser la única fuente de verdad: tablero (`id`, `name`, `elements`), selección, conector en construcción y estado remoto (`idle / loading / loaded / error`). Aplica reglas locales (mover solo no-conectores, crear conector solo con origen y destino válidos, borrar en cascada). | No debe tocar el DOM ni hacer peticiones HTTP. No conoce Spring ni SVG. |
| **BoardApiClient** (acceso REST) | `js/api/board-api-client.js` | Encapsular todo el detalle HTTP: rutas `/api/boards`, métodos, encabezados, serialización JSON y traducción de errores no-2xx a `BoardApiError` (`status`, `code`, `message`). | No debe modificar el estado ni decidir qué se muestra en pantalla. No debe inventar endpoints (`/move`, `/draw`); solo `POST`, `GET`, `PUT`. |
| **BoardView** (representación SVG/DOM) | `js/ui/board-view.js` | Proyectar un *snapshot* del estado en el `<svg>`: dibujar rectángulos, textos y conectores; capturar gestos del puntero (select, drag, connect) y emitirlos como eventos semánticos (`select`, `move`, `connectTarget`). | No debe almacenar estado de negocio (posiciones, selección) solo en el DOM. No debe llamar al API. |

## 1.3 Flujo de una acción típica ("Save")

1. El usuario presiona **Save** → `BoardApp` recibe el clic.
2. `BoardApp` pide a `BoardState` el tablero persistible (`toPersistedBoard()`) y marca el estado remoto como `loading`.
3. `BoardApp` invoca `BoardApiClient.save(board)`; el cliente hace `PUT /api/boards/{id}`.
4. Con la respuesta, `BoardApp` actualiza `BoardState` (`setBoard`, `setRemote('loaded')`) o registra el error (`setRemote('error', acción, error)`).
5. `BoardApp` llama `BoardView.render(state.snapshot())`; la vista redibuja todo a partir del snapshot.

Ningún módulo se salta a otro: la vista nunca habla con el API, el API nunca toca la vista.

## 1.4 Reglas de dependencia

- Dirección permitida: `BoardApp → {BoardState, BoardApiClient, BoardView}`.
- `BoardState`, `BoardApiClient` y `BoardView` **no se importan entre sí**.
- La vista recibe datos solo por `render(snapshot)` y devuelve intención solo por `on({...})`.
- El estado se expone por copia (`structuredClone`) para que nadie lo mute desde afuera.

## 1.5 Beneficios esperados

- **Testabilidad:** `BoardState` se prueba sin navegador ni servidor; `BoardApiClient` se prueba con un `fetch` simulado.
- **Preparación para el Lab 06:** cuando lleguen WebSocket/STOMP, solo se agrega un nuevo módulo de transporte que alimenta `BoardState`; la vista no cambia.
- **Evolución del contrato:** si el `BoardElement` cambia en el servidor, el impacto se concentra en `BoardApiClient` y en las reglas de `BoardState`.

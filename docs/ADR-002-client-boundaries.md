# ADR-002 — Client boundaries

**Estado:** Aceptado — Taller Semana 06
**Responsable de redacción:** Jhonatan David Madero (equipo: J. D. Madero, J. S. Murcia, J. S. Peña)

## Context
El cliente web del Collaborative Board debe evolucionar del starter del Lab 05 hacia un cliente interactivo sobre REST que luego (Lab 06) incorporará colaboración por WebSocket/STOMP. Sin una separación explícita, las responsabilidades de interfaz, estado, acceso HTTP y dibujo SVG tienden a concentrarse en un solo archivo, lo que dificulta pruebas, hace frágil la evolución del contrato (`CONNECTOR`) y obliga a reescribir la vista cuando cambie el transporte.

## Decision
Dividir el cliente en cuatro módulos ES con dependencias en una sola dirección:

- `BoardApp` (`app.js`): orquesta eventos de UI y coordina a los demás; único que conoce a los tres restantes.
- `BoardState` (`state/board-state.js`): única fuente de verdad (tablero, selección, conector en construcción, estado remoto `idle|loading|loaded|error` con `lastAction` y `error`). Expone snapshots inmutables.
- `BoardApiClient` (`api/board-api-client.js`): encapsula HTTP hacia `POST/GET/PUT /api/boards`; traduce errores a `BoardApiError`. No se agregan endpoints por gesto.
- `BoardView` (`ui/board-view.js`): proyecta el snapshot a SVG y emite eventos semánticos (`select`, `move`, `connectTarget`). No almacena estado de negocio en el DOM.

`BoardState`, `BoardApiClient` y `BoardView` no se importan entre sí.

## Consequences
- Cada módulo se puede probar de forma aislada (estado sin DOM, API con `fetch` simulado, vista con snapshots fijos).
- El soporte de conectores se concentra en `BoardState` (reglas) y `BoardView` (renderer); el cliente REST no cambia.
- El Lab 06 podrá añadir un módulo `BoardRealtimeClient` que alimente `BoardState` sin tocar la vista.
- Se paga un costo de indirección: acciones simples requieren pasar por `BoardApp → BoardState → BoardView.render`.
- Toda mutación local implica re-render completo del SVG (sin diffing); aceptable para tableros pequeños.

## Trade-off
Se prefiere **re-render completo desde snapshot** sobre **mutación incremental del DOM**. La primera opción es más simple y garantiza que la vista siempre refleje el estado; la segunda sería más eficiente pero abre la puerta a estado duplicado entre DOM y `BoardState`, justo el problema que se quiere evitar antes de introducir actualizaciones remotas en tiempo real.

## Evidence
- `docs/taller/01-responsabilidades.md` — tabla de responsabilidades y reglas de dependencia.
- `docs/taller/02-estados-remotos.md` — diagrama de estados y semántica de Retry.
- `docs/architecture/README.md` — Vista de Aplicación y diagrama de clases.
- Código: `src/main/resources/static/js/{app.js, state/board-state.js, api/board-api-client.js, ui/board-view.js}`.

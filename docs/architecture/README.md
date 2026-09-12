# Architecture Evidence — Lab 05

Responsable: Juan Sebastián Murcia (equipo: J. D. Madero, J. S. Murcia, J. S. Peña)

Todos los diagramas están en **lenguaje ArchiMate 3**, escritos con PlantUML (`!include <archimate/Archimate>`) y renderizados a PNG. Fuentes en `docs/architecture/archimate/*.puml`; para regenerar: `java -jar plantuml.jar -tpng docs/architecture/archimate/*.puml`.

## 1. Application View (ArchiMate)

![Vista de Aplicación](archimate/01-application-view.png)

Un *Application Component* "Collaborative Board Web Client" compuesto por `BoardApp`, `BoardState`, `BoardApiClient` y `BoardView`; un *Application Component* "Collaborative Board Backend" que expone la *Application Interface* `REST /api/boards` (POST/GET/PUT), realizada por `Board Application Service` y servida por `InMemoryBoardRepository`; y los *Data Objects* `Board` y `BoardElement` (`RECTANGLE | TEXT | CONNECTOR`). Solo `BoardApiClient` cruza la frontera del navegador. Detalle en `docs/taller/05-vista-aplicacion-y-clases.md`.

## 2. Diagrama de estructura del cliente (ArchiMate)

![Estructura del cliente](archimate/02-client-structure.png)

| Elemento | Archivo entregado |
|---|---|
| `BoardApp` | `src/main/resources/static/js/app.js` |
| `BoardState`, `RemoteState` | `src/main/resources/static/js/state/board-state.js` |
| `BoardApiClient`, `BoardApiError` | `src/main/resources/static/js/api/board-api-client.js` |
| `BoardView`, `ViewHandlers` | `src/main/resources/static/js/ui/board-view.js` |
| `Board`, `BoardElement` | `domain/model/Board.java`, `domain/model/BoardElement.java` |

## 3. Diagramas complementarios

- `archimate/03-remote-state-behavior.png` — comportamiento Idle/Loading/Loaded/Error/Retry (Parte 2).
- `archimate/04-element-rendering.png` — funciones de render por tipo de elemento (Parte 3).

Los diagramas representan el código entregado en el starter más las decisiones de diseño del Taller Semana 06.

# Parte 5 — Vista de Aplicación y estructura del cliente (ArchiMate)

**Responsable:** Juan Sebastián Murcia
**Taller:** ARSW Semana 06 — Diseño del cliente web del Collaborative Board

## 5.1 Vista de Aplicación (ArchiMate — capa de aplicación)

Elementos usados: *Business Actor*, *Application Component*, *Application Interface*, *Application Service*, *Data Object* y relaciones *composition*, *assignment*, *serving*, *realization* y *access*.

![Vista de Aplicación](../architecture/archimate/01-application-view.png)

Fuente (`docs/architecture/archimate/01-application-view.puml`):

```plantuml
@startuml 01-application-view
!include <archimate/Archimate>
title Vista de Aplicación (ArchiMate) — Collaborative Board, Lab 05

Business_Actor(user, "Modelador")

Grouping(client, "Application Component: Collaborative Board Web Client (navegador)") {
  Application_Component(app, "BoardApp\n(orquestación UI)")
  Application_Component(state, "BoardState\n(estado + reglas locales)")
  Application_Component(api, "BoardApiClient\n(adaptador REST)")
  Application_Component(view, "BoardView\n(proyección SVG)")
  Application_Interface(ui, "Interfaz SVG/DOM")
}

Grouping(server, "Application Component: Collaborative Board Backend (Spring Boot)") {
  Application_Interface(rest, "REST /api/boards\nPOST · GET · PUT")
  Application_Service(svc, "Board Application Service")
  Application_Component(repo, "InMemoryBoardRepository")
}

Application_DataObject(board, "Board\nid, name, elements[]")
Application_DataObject(element, "BoardElement\nRECTANGLE | TEXT | CONNECTOR")

Rel_Serving(ui, user)
Rel_Assignment(view, ui)
Rel_Composition(app, state)
Rel_Composition(app, api)
Rel_Composition(app, view)
Rel_Serving(rest, api, "HTTP/JSON")
Rel_Realization(svc, rest)
Rel_Serving(repo, svc)
Rel_Access(state, board)
Rel_Access(svc, board)
Rel_Composition(board, element)
@enduml
```

**Lectura de la vista**

- El cliente web es un único *Application Component* compuesto por cuatro subcomponentes; solo `BoardApiClient` cruza la frontera del navegador.
- La *Application Interface* `REST /api/boards` es el único punto de acoplamiento entre cliente y servidor; en el Lab 06 se agregará una segunda interfaz (`STOMP /topic/boards/{id}`) sin modificar `BoardView` ni `BoardState`.
- `Board` y `BoardElement` son los *Data Objects* compartidos; el contrato JSON es la representación de intercambio.

> Los cuatro diagramas se renderizan con `java -jar plantuml.jar -tpng docs/architecture/archimate/*.puml`. Si se requiere el modelo en Archi, los mismos elementos y relaciones se replican allí.

## 5.2 Diagrama de estructura del cliente (ArchiMate)

El equivalente al diagrama de clases se expresa en ArchiMate: cada módulo JS es un *Application Component* (con sus operaciones listadas en el nombre), las fronteras entre módulos son *Application Interfaces* (`ViewHandlers`, `Snapshot inmutable`, `REST /api/boards`) y las estructuras de datos son *Data Objects* (`Board`, `BoardElement`, `RemoteState`, `BoardApiError`).

![Estructura del cliente](../architecture/archimate/02-client-structure.png)

Fuente (`docs/architecture/archimate/02-client-structure.puml`):

```plantuml
@startuml 02-client-structure
!include <archimate/Archimate>
title Estructura del cliente web (ArchiMate) — componentes, interfaces y objetos de datos

Grouping(client, "Collaborative Board Web Client") {
  Application_Component(app, "BoardApp\nrefresh(), remote(), onNew/onLoad/onSave/onRetry,\nonAddRect/onAddText/onConnect/onDelete")
  Application_Component(state, "BoardState\nsnapshot(), setBoard(), select(), setRemote(),\naddRectangle(), addText(), moveSelected(),\nbeginConnect(), completeConnect(), removeSelected()")
  Application_Component(api, "BoardApiClient\ncreate(name), load(id), save(board)")
  Application_Component(view, "BoardView\nrender(snapshot), on(handlers)")
  Application_Interface(handlers, "ViewHandlers\nselect · move · connectTarget")
  Application_Interface(stateIf, "Snapshot inmutable")
}

Application_DataObject(board, "Board\nid, name, elements[]")
Application_DataObject(element, "BoardElement\nid, type, x, y, width, height,\ntext, sourceId, targetId")
Application_DataObject(remote, "RemoteState\nstatus: idle|loading|loaded|error\nlastAction, error")
Application_DataObject(apierr, "BoardApiError\nstatus, code, message")
Application_Interface(rest, "REST /api/boards")

Rel_Composition(app, state)
Rel_Composition(app, api)
Rel_Composition(app, view)
Rel_Assignment(state, stateIf)
Rel_Serving(stateIf, app)
Rel_Assignment(view, handlers)
Rel_Serving(handlers, app)
Rel_Access(state, board)
Rel_Access(state, remote)
Rel_Composition(board, element)
Rel_Composition(remote, apierr)
Rel_Access(api, board)
Rel_Access(api, apierr)
Rel_Access(view, board, "solo lectura (snapshot)")
Rel_Serving(rest, api)
@enduml
```

## 5.3 Trazabilidad diagrama ↔ código

| Elemento del diagrama | Archivo real |
|---|---|
| `BoardApp` | `src/main/resources/static/js/app.js` |
| `BoardState`, `RemoteState` | `src/main/resources/static/js/state/board-state.js` |
| `BoardApiClient`, `BoardApiError` | `src/main/resources/static/js/api/board-api-client.js` |
| `BoardView`, `ViewHandlers` | `src/main/resources/static/js/ui/board-view.js` |
| `Board`, `BoardElement` (cliente) | Objetos JSON planos; espejo de `domain/model/Board.java` y `BoardElement.java` |
| Interfaz REST | `infrastructure/web/rest/BoardRestController.java` |

## 5.4 Cambios respecto al diagrama del Lab 04

- Se agrega toda la rama del cliente (antes solo existía el backend).
- `BoardElement` gana el valor `CONNECTOR` y los atributos `sourceId`/`targetId`.
- Se introduce `RemoteState` como estructura explícita para los estados Idle/Loading/Loaded/Error y el `lastAction` de Retry.

# ARSW Collaborative Architecture Board — Lab 05 Starter

This starter is a **reference recovery baseline** for Lab #5. Your primary input should be your completed Lab #4 repository.

## What is already solved from Lab #4
- Domain/application/persistence/REST boundaries.
- POST /api/boards, GET /api/boards/{id}, PUT /api/boards/{id}.
- Consistent API errors.
- Unit and MVC tests.

## Lab #5 evolution
The web client is intentionally partial. Search for `TODO LAB-05`.

Target client boundaries:

```text
BoardApp
  |--> BoardApiClient --> REST
  |--> BoardState
  `--> BoardView --> SVG/DOM
```

## Run
```bash
mvn test
mvn spring-boot:run
```
Open http://localhost:8080/

## Continuity
The result of this lab becomes the input for Lab #6, where the same Board will gain WebSocket/STOMP collaboration. Do not add WebSockets yet.

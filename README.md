# TaskFlow Manager

Sistema de gestao de projetos estilo Jira/Trello com Kanban, autenticacao JWT, comentarios, anexos e dashboard.

## Stack

- Frontend: React + Vite + Tailwind + Axios
- Backend: FastAPI + SQLAlchemy + JWT
- Banco: PostgreSQL
- Infra: Docker + Docker Compose

## Arquitetura

```bash
TaskFlow-Manager/
	Front-End/
	Back-End/
	database/
	docker-compose.yml
```

## Funcionalidades implementadas

- Login e registro de usuario
- Criacao e listagem de projetos
- Quadro Kanban (TODO, IN_PROGRESS, DONE)
- Criar, editar e excluir tarefas
- Comentarios em tarefas
- Upload de anexos em tarefas
- Filtro por usuario (`assignee_id` na API)
- Dashboard com metricas (projetos, tarefas e status)
- Notificacoes de tarefa (atribuicao e mudanca de status)

## Como rodar com Docker

1. Na raiz do projeto, execute:

```bash
docker compose up --build
```

2. Acesse:

- Frontend: `http://localhost:5173`
- Backend (docs Swagger): `http://localhost:8000/docs`
- Healthcheck: `http://localhost:8000/health`

## Variaveis principais

Backend (`Back-End/.env.example`):

- `DATABASE_URL=postgresql://postgres:postgres@db:5432/taskflow`
- `JWT_SECRET=change-this-secret`
- `JWT_ALGORITHM=HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES=120`
- `UPLOAD_DIR=/app/uploads`
- `CORS_ORIGINS=http://localhost:5173`

Frontend (`Front-End/.env.example`):

- `VITE_API_URL=http://localhost:8000`

## Endpoints principais

- `POST /auth/register`
- `POST /auth/login`
- `GET/POST /projects`
- `GET/POST /projects/{project_id}/tasks`
- `PATCH/DELETE /projects/{project_id}/tasks/{task_id}`
- `GET/POST /projects/{project_id}/tasks/{task_id}/comments`
- `GET/POST /projects/{project_id}/tasks/{task_id}/attachments`
- `GET /dashboard/metrics`
- `GET /notifications`
- `PATCH /notifications/{notification_id}/read`

## Observacoes

- O banco e criado automaticamente no startup da API via SQLAlchemy `create_all`.
- Este projeto esta pronto para evoluir com refresh token, permissoes por equipe e websocket para notificacoes em tempo real.

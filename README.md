# TaskFlow

**TaskFlow** é uma aplicação web completa de gerenciamento de projetos e tarefas, desenvolvida como demonstração de competências full‑stack. A solução inclui backend Java Spring Boot, frontend React + TypeScript, e infraestrutura Docker.

## Índice
- [Visão geral](#vis%C3%A3o-geral)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Pré‑requisitos](#pr%C3%A9-requisitos)
- [Instalação e execução](#instala%C3%A7%C3%A3o-e-execu%C3%A7%C3%A3o)
- [API](#api)
- [Testes](#testes)
- [Estrutura de diretórios](#estrutura-de-diret%C3%B3rios)
- [Próximos passos](#pr%C3%B3ximos-passos)

## Visão geral
TaskFlow permite que o usuário crie projetos, registre tarefas, defina prioridades, altere status, visualize indicadores de produtividade em um dashboard e organize tarefas em um quadro Kanban. Tudo isso funcionando em containers Docker isolados.

## Tecnologias
| Camada | Tecnologia |
|--------|------------|
| **Backend** | Java 21, Spring Boot 3.2, Spring Data JPA, Bean Validation, Flyway, Springdoc OpenAPI, Actuator |
| **Banco** | PostgreSQL 16 |
| **Frontend** | React 18, TypeScript, React Router, Axios, Vite |
| **Infra** | Docker, Docker‑Compose |

## Arquitetura
```
TaskFlow (root)
│
├─ backend/          # Spring Boot application
│   ├─ src/main/java/br/com/taskflow/   # código Java
│   ├─ src/main/resources/            # application.yml, Flyway migrations
│   └─ pom.xml                         # Maven build
│
├─ frontend/         # React + Vite
│   ├─ src/          # componentes React
│   ├─ public/       # index.html
│   └─ vite.config.ts
│
├─ docker-compose.yml  # orquestração dos containers
├─ .env.example        # variáveis de ambiente de exemplo
├─ README.md           # documentação
└─ .gitignore
```

## Pré‑requisitos
- **Docker** e **docker‑compose** instalados.
- **Node.js** (versão 20+) e **npm** para desenvolvimento local (opcional).
- **Java 21** (para compilar o backend fora do container, opcional).

## Instalação e execução
1. Clone o repositório (ou copie o diretório `taskflow`).
2. Copie o arquivo de exemplo de variáveis de ambiente:
   ```bash
   cp taskflow/.env.example taskflow/.env
   ```
   Ajuste os valores se necessário.
3. Inicie a aplicação com Docker Compose:
   ```bash
   cd taskflow
   docker compose up --build -d
   ```
   - Backend estará disponível em **http://localhost:8080**
   - Frontend em **http://localhost:5173**
4. A aplicação executa as migrações do Flyway automaticamente na primeira inicialização.
5. Acesse a documentação Swagger em `http://localhost:8080/swagger-ui.html`.

## API
A API REST está disponível no caminho `/api`. Principais endpoints:
- **Projetos**: `GET /api/projects`, `POST /api/projects`, `PUT /api/projects/{id}`, `DELETE /api/projects/{id}`
- **Tarefas**: `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/{id}`, `PATCH /api/tasks/{id}/status`, `PATCH /api/tasks/{id}/priority`, `DELETE /api/tasks/{id}`
- **Dashboard**: `GET /api/dashboard/summary`, `GET /api/dashboard/tasks-by-status`, `GET /api/dashboard/upcoming-deadlines`

Todos os DTOs são validados via Bean Validation; erros retornam `400` com detalhes.

## Testes
Backend:
```bash
cd taskflow/backend
./mvnw test
```
Os testes unitários utilizam JUnit 5 e Mockito. No momento, há cobertura básica para criação e atualização de projetos.

Frontend:
```bash
cd taskflow/frontend
npm install
npm run test   # (testes ainda a serem adicionados)
```

## Estrutura de diretórios
```
taskflow/
│   docker-compose.yml
│   .env.example
│   README.md
│   .gitignore
│
├─ backend/
│   ├─ src/main/java/br/com/taskflow/   # código Java
│   ├─ src/main/resources/             # YAML, migrations
│   ├─ pom.xml
│   └─ Dockerfile
│
└─ frontend/
    ├─ src/
    │   ├─ pages/   # Dashboard, Projects, Tasks, Kanban
    │   ├─ api.ts
    │   └─ App.tsx
    ├─ public/
    ├─ package.json
    ├─ vite.config.ts
    └─ Dockerfile
```

## Próximos passos
- **Testes de integração** para o backend (REST Assured ou Spring MockMvc).
- **Cobertura de testes** no frontend com Jest + React Testing Library.
- **Tema escuro** opcional no UI.
- **Melhorias de UI** usando uma biblioteca de componentes (e.g., Material‑UI ou Radix).
- **Autenticação** (opcional) usando Spring Security com JWT para produção.
- **CI/CD** com GitHub Actions para build e publicação de imagens Docker.

---

**Licença**: MIT – sinta‑se livre para adaptar e usar como portfólio.

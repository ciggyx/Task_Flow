# TaskFlow

> **TaskFlow** — Aplicación web responsiva para gestión de tareas y proyectos. Permite crear dashboards, gestionar tareas y grupos, compartir tableros y generar reportes de actividad.

> Backend: **NestJS** (microservicios) · Frontend: **Angular** · Monorepo: **Nx**

---

## Resumen ejecutivo
Un repositorio monorepo gestionado con **Nx** que contiene:
- **Frontend**: app Angular (UI responsiva).
- **API Gateway**: puerta de entrada REST/gateway a los microservicios.
- **Microservicio de usuarios**.
- **Microservicio de tasks**.
- **Microservicio de email**.
---

## Quickstart
Clonar, instalar y levantar el back completo:

```bash
git clone https://github.com/ciggyx/Sistema-gestion-de-Notas.git
cd taskflow
npm install
npm run dev
```

Levantar microservicios individuales:

```bash
nx serve microservice-users
nx serve microservice-tasks
nx serve api-gateway
nx serve frontend
```

---

## Comandos útiles

- **Levantar microservicios**  
  `nx serve microservice-users`  
  `nx serve microservice-tasks`  
  `nx serve api-gateway`

- **Levantar todo el backend**  
  `npm run dev`

- **Formatear**  
  `npm run format`

- **Lint**  
  `nx lint microservice-users`  
  `nx lint microservice-tasks`  
  `nx lint microservice-gateway`  
  `npm run lint`

- **Build**  
  `nx build microservice-users`  
  `nx run-many --target=build --all --parallel`

- **Grafo de dependencias**  
  `nx graph`

- **Limpiar cache**  
  `nx reset`

---

## Requisitos
- Node.js 18+
- npm
- Nx CLI opcional (`npm i -g nx`)
- Variables de entorno configuradas (ver abajo)

---

## Variables de entorno

### `microservice-users/config/env/development.env`

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=admin
DB_DATABASE=UsersDatabase
JWT_AUTH_SECRET=supersecreto
JWT_AUTH_EXPIRES=30m
JWT_REFRESH_SECRET=secretoenlasmontañas
JWT_REFRESH_EXPIRES=1d
```

### `api-gateway/src/config/microservice.config.ts`

```
USERS_SERVICE=http://localhost:4001
DASHBOARD_SERVICE=http://localhost:4000
```

---

## Arquitectura del Monorepo (Nx)

```
/
├─ apps/
│  ├─ api-gateway/
│  ├─ api-gateway-e2e/
│  ├─ microservice-users/
│  ├─ microservice-users-e2e/
│  ├─ microservice-tasks/
│  ├─ microservice-tasks-e2e/
│  ├─ frontend/
├─ package.json
├─ nx.json
```

---

## Checklist para evaluador

1. Clonar repo y `npm install`.
2. Crear `.env` según los ejemplos.
3. Levantar DB local.
4. Ejecutar `npm run dev`.
5. Probar flujos:
   - registro usuario  
   - crear dashboard  
   - crear tarea  
   - invitaciones  
   - estadísticas  
6. Revisar dependencias con `nx graph`.

---

## Desarrolladores

| [<img src="https://avatars.githubusercontent.com/u/134315472?v=4" width=115><br><sub>Alexander Massietti</sub>](https://github.com/ciggyx) |  [<img src="https://avatars.githubusercontent.com/u/69809879?v=4" width=115><br><sub>Julián Fermani</sub>](https://github.com/JulianFermani) |  [<img src="https://avatars.githubusercontent.com/u/179271177?v=4" width=115><br><sub>Lisandro Medina</sub>](https://github.com/lisandromedinautn) | [<img src="https://avatars.githubusercontent.com/u/160081834?v=4" width=115><br><sub>Ulises Francioni</sub>](https://github.com/UlisesFrancioni) |
| :---: | :---: | :---: | :---: |
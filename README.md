# MediConnect - Backend (NestJS)

This is the backend API for MediConnect, built with **NestJS** and running
on **dummy, in-memory data** - no AWS account, DynamoDB, or Cognito needed
to run and demo it. It implements every endpoint the frontend's
`services/` layer already expects, with real request validation and
role-based access control (RBAC) - just not backed by real AWS yet.

It mirrors the frontend's approach: same idea of dummy-now, swap-later,
so both sides of the project can be developed and demoed independently
before the AWS services in the proposal are actually deployed.

---

## 1. Software to install first

1. **Node.js** version 18+ (same requirement as the frontend). Check with:
   ```
   node -v
   npm -v
   ```
2. **VS Code** (if not already installed).

No AWS account, database, or other service is needed to run this dummy version.

---

## 2. Getting it running

```
npm install
npm run start:dev
```

The server starts on **http://localhost:3000** by default (edit `PORT` in
`.env` - copy from `.env.example` - to change it). It restarts automatically
whenever a file is saved.

To confirm it's running, open http://localhost:3000 in a browser - it
should show `{"status":"ok","service":"mediconnect-backend"}`.

---

## 3. How "login" works here (dummy auth)

There's no Cognito yet, so this API doesn't issue or check real tokens.
Instead, protected endpoints expect two plain headers standing in for what
a decoded Cognito JWT would normally provide:

```
x-user-id: patient1
x-user-role: patient        (patient | provider | admin)
```

The frontend's real `apiClient.js` will need to send these two headers
(or, once Cognito exists, a real `Authorization: Bearer <token>` header
that `RolesGuard` decodes instead - see section 6). Missing headers on a
protected endpoint return `401`; a header with the wrong role returns `403`.

**Example - a Patient booking an appointment:**
```
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -H "x-user-id: patient1" \
  -H "x-user-role: patient" \
  -d '{"slotId":"SLT-2"}'
```

---

## 4. API endpoints

| Method | Path | Who | What |
|---|---|---|---|
| GET | `/providers?city=&query=` | Public | Search approved providers |
| GET | `/providers/:id` | Public | Provider details |
| PATCH | `/providers/:id` | Admin | Approve/reject a provider |
| GET | `/providers/:providerId/doctors` | Public | Doctors at a clinic |
| POST | `/providers/:providerId/doctors` | Provider | Add a doctor |
| GET | `/doctors/:id` | Public | Doctor details |
| DELETE | `/doctors/:id` | Provider | Remove a doctor |
| GET | `/doctors/:doctorId/slots` | Public | A doctor's slots |
| POST | `/doctors/:doctorId/slots` | Provider | Add a slot |
| PATCH | `/slots/:id` | Provider | Update a slot's status (e.g. block it) |
| POST | `/bookings` | Patient | Book a slot (the transactional flow) |
| GET | `/bookings/mine` | Patient | The logged-in patient's bookings |
| PATCH | `/bookings/:id` | Patient/Provider | Update a booking's status (e.g. cancel) |
| GET | `/providers/:providerId/bookings` | Provider | A clinic's bookings |
| GET | `/admin/stats` | Admin | Basic platform numbers |
| GET | `/admin/providers/pending` | Admin | Providers awaiting approval |

Every write endpoint validates its request body (via DTOs) and returns a
`400` with a clear message if something's missing or the wrong type -
try posting an empty body to see this.

---

## 5. Project structure

```
src/
  main.ts               -> bootstraps the app: CORS, validation, error format
  app.module.ts          -> wires every feature module together
  providers/              -> providers controller + service
  doctors/                -> doctors controller + service
  slots/                  -> slots controller + service
  bookings/                -> bookings controller + service (the transaction lives here)
  admin/                   -> admin stats + pending-provider approval
  common/
    data/seed.ts            -> the in-memory "database" (deleted once DynamoDB is connected)
    guards/roles.guard.ts    -> dummy RBAC now, real Cognito JWT check later
    decorators/roles.decorator.ts -> @Roles('patient') etc., used on each endpoint
    dto/                      -> request body validation rules
    filters/all-exceptions.filter.ts -> one consistent error response shape
```

Each feature folder follows the same NestJS pattern: a **controller**
(defines the routes, applies `@Roles(...)`), a **service** (the actual
logic, currently reading/writing `common/data/seed.ts`), and a **module**
(wires the two together). This is the same "one job per layer" principle
the frontend's architecture plan uses.

---

## 6. Connecting the real backend later

When DynamoDB and Cognito are ready, two things change - nothing else:

1. **Each service's data access** - every function in `providers/`,
   `doctors/`, `slots/`, `bookings/`, and `admin/` has a comment showing
   the DynamoDB access pattern it will use (e.g. "Query on partition key
   doctorId"). The function names and return shapes stay the same, so
   controllers never change.
2. **`common/guards/roles.guard.ts`** - replace the header-reading logic
   with real Cognito JWT verification (decode the `Authorization` header,
   check the token's role claim). Every `@Roles(...)` decorator across
   every controller keeps working exactly as it does now.

---

## 7. Useful commands

| Command | What it does |
|---|---|
| `npm install` | Installs dependencies |
| `npm run start:dev` | Runs the server with auto-restart on file changes |
| `npm run build` | Type-checks and compiles to `dist/` |
| `npm start` | Runs the already-built `dist/main.js` (what EC2 will run) |

---

## 8. Connecting this to the frontend

The frontend's `.env` needs `VITE_API_URL=http://localhost:3000` to point
at this server once its `api/apiClient.js` is switched on. Until then, the
frontend keeps working fully on its own dummy data - the two projects
don't need to run together to be developed or demoed separately.

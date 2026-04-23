# Smart Campus Operations Hub

Location: `/Users/nikshanps/Desktop/TeCups/PAF_moduleC/it3030-paf-2026-smart-campus-WE_202_2.1`

## Stack
- Spring Boot 4 (REST, Security, MongoDB, OAuth2, JWT)
- React + Vite + Tailwind (client)

## Quick start
1. Set environment (`application-local.properties`): Mongo URI, `JWT_SECRET`, `FRONTEND_URL`, Google OAuth keys.
2. Run backend:
   - `cd /Users/nikshanps/Desktop/TeCups/PAF_moduleC/it3030-paf-2026-smart-campus-WE_202_2.1`
   - `./mvnw spring-boot:run`
3. Run frontend:
   - `cd /Users/nikshanps/Desktop/TeCups/PAF_moduleC/it3030-paf-2026-smart-campus-WE_202_2.1/smart-campus-system-frontend`
   - `npm install`
   - `npm run dev` (or `npm run build` for production)

## Seed users (for demos)
CommandLineRunner seeds three accounts when the app starts (controlled by `app.bootstrap.enabled=true`, default):
- Admin: `admin@campus.local` / `Admin@123`
- Technician: `tech@campus.local` / `Tech@123`
- Student user: `student@campus.local` / `Student@123`
Change passwords or disable seeding in production (`app.bootstrap.enabled=false`).

## Core API endpoints
- Auth: `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, admin user mgmt at `/api/v1/auth/users`.
- Resources (Module A): `GET /api/v1/resources?type&status&location&minCapacity`, `POST /api/v1/resources` (admin), `PUT /api/v1/resources/{id}`.
- Bookings (Module B): user `POST /api/v1/bookings`, `GET /api/v1/bookings/my`; admin `GET /api/v1/bookings`, `PATCH /api/v1/bookings/{id}/status`, cancel `PATCH /api/v1/bookings/{id}/cancel`.
- Tickets (Module C): file-upload create `POST /api/v1/tickets`, status/assign/resolution per existing endpoints.
- Notifications (Module D): `GET /api/v1/notifications`, `PATCH /api/v1/notifications/{id}/read`, `PATCH /api/v1/notifications/read-all`.

## UI routes
- Dashboard `/dashboard`
- Facilities `/resources`
- Bookings: create `/bookings/create`, my `/bookings/my`, admin approvals `/admin/bookings`
- Tickets: create `/tickets/create`, my `/tickets/my`, admin `/admin/tickets`, technician `/technician/tickets`
- OAuth success `/oauth-success`

## Manual test script (seed & flow)
1) Login as admin (`admin@campus.local`) and create a couple of resources in UI or via cURL:
```
curl -X POST http://localhost:8080/api/v1/resources \
  -H "Authorization: Bearer <ADMIN_JWT>" -H "Content-Type: application/json" \
  -d '{"name":"Lab 201","type":"LAB","capacity":30,"location":"Engineering Block","status":"ACTIVE"}'
```
2) As student user, request two overlapping bookings on the same resource to trigger conflict prevention; second call should return 400.
3) As admin, approve one booking and reject another; observe notifications in UI bell and `/api/v1/notifications`.
4) Create a ticket with an image; assign to technician; set status to IN_PROGRESS/RESOLVED/REJECTED and confirm notifications and comment alerts.

## CI
- GitHub Actions workflow expected (build + test) — ensure it runs `./mvnw test` and `npm run build`.

## Notes
- JWT secret must be Base64 encoded.
- File uploads stored under `uploads/tickets` (ensure writable).

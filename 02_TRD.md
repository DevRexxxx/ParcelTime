# ParcelTime — Technical Requirements Document (TRD)

| | |
|---|---|
| **Version** | 1.0 (MVP) |
| **Status** | Draft for build |
| **Audience** | Engineers, QA, DevOps |
| **Related docs** | 01_PRD, 03_Architecture, 06_System_Design_Rules |

This document specifies what must be built technically. It contains no source code. Names of entities, endpoints and states are normative; field types are described in plain language.

---

## 1. Technology Decisions

| Layer | Decision | Notes |
|---|---|---|
| Repository | Monorepo with workspaces: web app, API, shared package | Shared package holds validation schemas, enums and API types so client and server cannot drift. |
| Language | TypeScript everywhere, strict mode | |
| Web app | React with Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query | Delivered as a PWA (installable, service worker, offline queue for reception). |
| Forms and validation | Schema-based validation shared between client and server | |
| API | Node.js with Express, REST, JSON | Versioned under a version prefix. |
| Database | PostgreSQL (managed, India region) | Single primary; daily backups; point-in-time recovery if available. |
| ORM and migrations | Prisma with versioned migrations | |
| Background jobs | pg-boss (job queue on PostgreSQL) | Avoids operating Redis for the MVP. |
| Realtime | Not in MVP core. Use query refetching and push. Optional live task list for executives behind a feature flag. | Reassess after pilot. |
| Push | Firebase Cloud Messaging (web push) | iOS web push works only for installed PWAs on recent iOS; document this limitation. |
| File storage | Private S3-compatible bucket in an India region | Access only through presigned URLs with short expiry. |
| QR generation | Server-side generation of QR payloads; client renders and prints | QR payload is an opaque token. |
| Scanning | Browser-based QR and barcode scanning | Camera permission handling and manual-entry fallback are required. |
| API docs | OpenAPI generated from the shared schemas | Published on staging. |
| Testing | Vitest (unit and component), Supertest (API), Testcontainers (real PostgreSQL), Playwright (end to end) | |
| Observability | Structured logs, error tracking, uptime checks, database metrics | |
| CI/CD | GitHub Actions | Lint, type-check, test, migration check, deploy. |
| Hosting | Web on a static host/CDN; API on a container host in an India region; API and web on the same site domain for cookie safety | |

## 2. Repository Layout (logical)

- **apps/web** — all front-end code, organised by feature: auth, onboarding, parcels, scheduling, deliveries, notifications, admin.
- **apps/api** — modules by domain: auth, invites, societies, units, members, storage, slots, parcels, schedules, tasks, handover, notifications, reports, audit, health. Plus config, middleware, jobs and shared services.
- **packages/shared** — enums (roles, states, event types), validation schemas, API contracts, error codes.
- **docs** — these documents, ADRs, runbooks.
- **infra** — environment definitions and deployment configuration.

## 3. Roles and Permissions

| Role | Scope | Summary of capabilities |
|---|---|---|
| PLATFORM_ADMIN | All societies | Create societies, create first admin, support access (audited). |
| SOCIETY_ADMIN | One society | Everything inside the society: units, members, invites, slots, storage, assignment, reports, audit, exceptions. |
| RECEPTION | One society | Register parcels, move storage, release for pickup, confirm pickup, return to courier, assign tasks (if allowed by settings), view all society parcels. |
| DELIVERY_EXECUTIVE | One society | View assigned or claimable tasks, start delivery by scan, verify OTP, record failure. Sees only data needed for the task. |
| RESIDENT | One society, own units | View own units' parcels, schedule, reschedule, cancel, request pickup, view OTP for own parcel, notification preferences. |

Rules:
- A user holds one or more roles per society through a membership record.
- Permissions are checked on every request using role, active society and, for residents, unit membership.
- A resident sees a parcel only if they are an active member of the parcel's unit.

## 4. Data Model

All tenant tables carry the society identifier. Timestamps are stored in UTC. Identifiers are non-guessable (UUID-style). Soft deactivation is preferred over deletion for people and units.

### 4.1 Entities

**Society** — name, address, timezone, status, settings (slot cutoff, scheduling horizon in days, unclaimed threshold in days, photo-required flag, assignment mode, OTP expiry minutes, max failed attempts before flag), created time.

**User** — full name, email, phone (unique where present), password hash, status, last login, created and updated times. A user is global; society access comes from membership.

**SocietyMember** — user, society, roles (one or more), status (invited, active, suspended), created time. Unique per user and society.

**Tower** — society, name.

**Unit** — society, tower, floor, unit number, status. Unique per society, tower and unit number.

**UnitMembership** — unit, user, type (owner, tenant, family), status (pending, active, ended), approved by, approved time. A unit may have many active members.

**Invite** — society, target email or phone, intended roles, intended unit (for residents), token hash, expiry, status (pending, accepted, revoked, expired), created by.

**JoinRequest** — society, user, requested unit, status (pending, approved, rejected), reviewed by, reviewed time.

**StorageLocation** — society, name, capacity (number of parcels), active flag.

**Parcel** — society, public parcel code (short human-readable, unique per society), QR token (opaque, unique), courier company, tracking number, unit, optional recipient name, received by (user), received time, storage location, photo reference, status, status updated time, failed attempt count, notes, created and updated times.
- Unique: society + courier + tracking number.
- Indexed: society + status, society + unit, tracking number.

**SlotTemplate** — society, label, start time of day, end time of day, capacity, active weekdays, active flag.

**SlotInstance** — society, template, date, capacity (copied, editable per date), booked count, status (open, blocked). Unique per template and date. Generated ahead of time by a scheduled job for the scheduling horizon plus buffer.

**DeliverySchedule** — parcel, requested by, slot instance, status (active, cancelled, completed, superseded), created and updated times. A parcel has at most one active schedule (enforced in the database).

**DeliveryTask** — schedule, parcel, assigned executive (nullable in pool mode), status (open, assigned, in progress, done, failed, cancelled), assigned by, assigned time, started time, finished time.

**HandoverChallenge** — parcel, task, hashed OTP, salt or keyed-hash reference, expiry time, attempts used, max attempts, status (active, verified, expired, locked, replaced), created time. At most one active challenge per parcel.

**DeliveryAttempt** — task, executive, outcome (delivered, failed), verification method (OTP, staff override), failure reason (coded list), override reason and override approver (when applicable), proof photo reference, time.

**PickupRequest** — parcel, requested by, status (requested, completed, cancelled, expired), verified by, verification method, completed time.

**Notification** — user, society, type, title, message, related parcel, read flag, created time.

**OutboxEvent** — society, event type, payload reference, status (pending, processed, failed), attempts, next attempt time, created time. Written in the same transaction as the business change.

**DeviceToken** — user, platform, token, last seen, active flag.

**NotificationPreference** — user, category, enabled.

**AuditLog** — society, parcel (nullable), actor user (or system), actor role, event type, previous status, new status, metadata (structured), request identifier, created time. Append-only.

### 4.2 Database integrity requirements
1. A partial unique constraint ensures one active schedule per parcel and one active handover challenge per parcel.
2. A check ensures slot instance booked count never exceeds capacity and never goes below zero.
3. Foreign keys are enforced everywhere; deletions of referenced records are restricted.
4. The application database user has no permission to update or delete audit log rows.
5. Row-level security on tenant tables is enabled as defence in depth, using the active society from the session.

## 5. Parcel State Machine

### 5.1 States
RECEIVED, IN_STORAGE, SCHEDULED, ASSIGNED, OUT_FOR_DELIVERY, DELIVERED, DELIVERY_FAILED, PICKUP_REQUESTED, PICKED_UP, UNCLAIMED, RETURNED_TO_COURIER.

Terminal: DELIVERED, PICKED_UP, RETURNED_TO_COURIER.

### 5.2 Allowed transitions

| From | To | Triggered by | Conditions |
|---|---|---|---|
| (new) | RECEIVED | Reception | Valid unit, no duplicate tracking number. |
| RECEIVED | IN_STORAGE | Reception or system | Storage location set. Registration performs both steps atomically in normal use. |
| IN_STORAGE | SCHEDULED | Resident (or admin) | Slot open, capacity available, before cutoff, within horizon. |
| IN_STORAGE | PICKUP_REQUESTED | Resident | Resident is a member of the unit. |
| IN_STORAGE | UNCLAIMED | System job | Age beyond society threshold with no active schedule or request. |
| IN_STORAGE | RETURNED_TO_COURIER | Reception or admin | Reason required. |
| SCHEDULED | IN_STORAGE | Resident, admin or system | Schedule cancelled or slot blocked. |
| SCHEDULED | ASSIGNED | Admin, reception or executive (claim) | Executive is active in the society. |
| ASSIGNED | SCHEDULED | Admin or reception | Unassign. |
| ASSIGNED | OUT_FOR_DELIVERY | Executive | Parcel QR scanned by the assigned executive. |
| OUT_FOR_DELIVERY | DELIVERED | Executive | OTP verified, or staff override with reason and proof. |
| OUT_FOR_DELIVERY | DELIVERY_FAILED | Executive | Failure reason required. |
| DELIVERY_FAILED | IN_STORAGE | Executive or reception | Parcel returned to storage; resident notified. |
| PICKUP_REQUESTED | PICKED_UP | Reception | Identity or OTP verified. |
| PICKUP_REQUESTED | IN_STORAGE | Resident, reception or system | Cancelled or expired. |
| UNCLAIMED | IN_STORAGE | Resident or admin | Resident reactivates. |
| UNCLAIMED | RETURNED_TO_COURIER | Admin | Reason required. |

Rescheduling is a change of the active schedule while the parcel remains SCHEDULED; the old schedule is marked superseded and the slot counts are adjusted in one transaction.

### 5.3 Rules
- Every transition runs through a single backend function that validates the table above, checks the actor's permission, writes the new state, writes the audit record and enqueues notification events in one database transaction.
- Any transition not listed is rejected with a clear error.
- Clients never send a target state; they call named actions.

## 6. Core Algorithms and Specifications

### 6.1 Slot booking
1. Start a transaction.
2. Load the parcel and verify the actor may act on it and that its state is IN_STORAGE (or SCHEDULED for reschedule).
3. Lock the chosen slot instance row for update.
4. Verify the slot is open, inside the scheduling horizon and before the cutoff in the society's timezone.
5. Verify booked count is below capacity.
6. Create the new schedule; for reschedule, mark the old one superseded and release its slot count.
7. Increment the booked count; create or update the delivery task.
8. Transition the parcel state, write audit, enqueue notification events.
9. Commit. On any failure, roll back everything and return a specific error (slot full, cutoff passed, invalid state).

Concurrency test requirement: many parallel requests against a single remaining seat must result in exactly one success.

### 6.2 Slot instance generation
A nightly job creates slot instances for the next scheduling horizon plus a buffer from active templates. Changes to a template apply to future instances without bookings; instances with bookings require admin confirmation and notify affected residents.

### 6.3 Handover OTP
- Generated when the resident opens the handover screen for a parcel whose state is OUT_FOR_DELIVERY, or when pickup verification starts.
- Six digits, cryptographically random.
- Stored only as a keyed hash; never logged.
- Expires after the society's configured minutes (default proposal: 10).
- Maximum five wrong attempts, after which the challenge is locked and the resident must generate a new one.
- Regeneration limited (default proposal: three per hour per parcel); the previous challenge is replaced.
- Verification is constant-time and rate-limited per parcel and per actor.
- Staff override: allowed only for the executive's assigned task, requires a coded reason, a proof photo, and creates a flagged audit event visible to the admin for review.

### 6.4 Notifications
- Business code never calls push providers directly. It writes outbox events in the same transaction as the change.
- A dispatcher job reads pending events, creates the in-app notification records, applies user preferences and sends push to active device tokens.
- Failures retry with backoff up to a limit, then mark failed and raise an alert.
- Invalid device tokens are deactivated.
- Critical categories (handover, security, join decisions) ignore user opt-out for in-app display.

### 6.5 Background jobs

| Job | Schedule | Purpose |
|---|---|---|
| Outbox dispatcher | Continuous | Deliver notifications. |
| Slot instance generator | Nightly | Create future slot instances. |
| Delivery reminder | Every few minutes | Remind residents and executives before a window. |
| Unclaimed ageing | Hourly | Warn, then move parcels to UNCLAIMED per threshold. |
| Overdue task monitor | Every few minutes | Flag tasks still open after window end. |
| Challenge cleanup | Hourly | Expire old OTP challenges. |
| Retention cleanup | Daily | Remove expired photos and logs per policy. |
| Invite expiry | Hourly | Expire stale invites. |

Jobs must be idempotent and safe to run twice.

### 6.6 File upload
1. Client requests an upload permission for a parcel; the API returns a short-lived presigned upload target restricted by file type and size.
2. Client compresses the image before upload (target under 500 KB).
3. Client uploads directly to private storage, then confirms to the API, which records the reference.
4. Reads use presigned URLs with short expiry, issued only to authorised users.
5. Size and type limits are enforced server-side; metadata such as location data is stripped.

### 6.7 QR payload
The QR contains only an opaque token mapped to the parcel. Scanning resolves the token through an authenticated API call restricted by role and society. Tokens can be rotated by an admin.

## 7. API Specification

Base path: version 1 prefix. JSON only. The active society comes from the authenticated session. Pagination uses cursors; lists support filters and sorting where noted. All write endpoints validate input against shared schemas.

### 7.1 Auth and profile
| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| POST | /auth/login | Public | Sign in. |
| POST | /auth/refresh | Public (cookie) | Rotate refresh token and issue access token. |
| POST | /auth/logout | Authenticated | Revoke refresh token. |
| POST | /auth/accept-invite | Public (token) | Create account or link existing account from invite. |
| POST | /auth/forgot-password | Public | Start reset. |
| POST | /auth/reset-password | Public (token) | Complete reset. |
| POST | /auth/switch-society | Authenticated | Change active society. |
| GET | /me | Authenticated | Profile, memberships, units. |
| PATCH | /me | Authenticated | Update profile. |

### 7.2 Society setup
| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| GET, PATCH | /society | Admin | Society profile and settings. |
| GET, POST | /towers | Admin | List and create towers. |
| GET, POST, PATCH | /units | Admin (read: staff) | List, create, update units. |
| POST | /units/import | Admin | Bulk import with validation report. |
| GET | /units/search | Staff, Admin | Typeahead lookup for reception. |
| GET, POST | /invites | Admin | List and create invites. |
| POST | /invites/{id}/resend, /revoke | Admin | Manage invites. |
| GET | /join-requests | Admin | Pending requests. |
| POST | /join-requests/{id}/approve, /reject | Admin | Decide. |
| POST | /join-requests | Resident | Request to join a unit. |
| GET, PATCH | /members | Admin | List, change roles, suspend. |
| GET, POST, PATCH | /storage-locations | Admin (read: staff) | Manage locations. |
| GET, POST, PATCH | /slot-templates | Admin | Manage templates. |
| PATCH | /slot-instances/{id} | Admin | Block or change capacity for a date. |

### 7.3 Parcels
| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| POST | /parcels | Reception, Admin | Register parcel (with idempotency key). |
| GET | /parcels | All (scoped) | List with filters (status, unit, date, text). |
| GET | /parcels/{id} | All (scoped) | Parcel detail. |
| GET | /parcels/{id}/timeline | Admin, Reception, Resident (own) | Status history. |
| POST | /parcels/{id}/photo-upload-url | Reception, Executive | Presigned upload target. |
| POST | /parcels/{id}/photo-confirm | Reception, Executive | Record uploaded photo. |
| POST | /parcels/resolve-qr | Staff | Resolve scanned token. |
| POST | /parcels/{id}/move-storage | Reception, Admin | Change storage location. |
| POST | /parcels/{id}/return-to-courier | Reception, Admin | Return with reason. |

### 7.4 Scheduling and tasks
| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| GET | /slots/availability | Resident, Admin | Open slots by date range. |
| POST | /parcels/{id}/schedule | Resident, Admin | Book a slot. |
| PATCH | /schedules/{id} | Resident, Admin | Reschedule. |
| DELETE | /schedules/{id} | Resident, Admin | Cancel. |
| GET | /tasks | Executive, Admin, Reception | Task list with filters. |
| GET | /tasks/{id} | Executive, Admin, Reception | Task detail. |
| POST | /tasks/{id}/assign | Admin, Reception | Assign executive. |
| POST | /tasks/{id}/unassign | Admin, Reception | Unassign. |
| POST | /tasks/{id}/claim | Executive | Claim in pool mode. |
| POST | /tasks/{id}/start | Executive | Start delivery after QR scan. |
| POST | /tasks/{id}/verify-otp | Executive | Verify handover. |
| POST | /tasks/{id}/override-handover | Executive | Controlled override. |
| POST | /tasks/{id}/fail | Executive | Record failed attempt. |
| POST | /parcels/{id}/handover-otp | Resident (own) | Generate or regenerate OTP. |

### 7.5 Pickup
| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| POST | /parcels/{id}/pickup-request | Resident | Request pickup. |
| DELETE | /parcels/{id}/pickup-request | Resident, Reception | Cancel request. |
| POST | /parcels/{id}/pickup-complete | Reception | Complete after verification. |

### 7.6 Notifications, reports, audit, health
| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| GET | /notifications | Authenticated | List. |
| POST | /notifications/{id}/read, /read-all | Authenticated | Mark read. |
| POST, DELETE | /devices | Authenticated | Register or remove push token. |
| GET, PATCH | /notification-preferences | Authenticated | Preferences. |
| GET | /reports/summary | Admin | Dashboard metrics. |
| GET | /reports/parcels | Admin | Detailed report, CSV export. |
| GET | /audit-logs | Admin | Filterable audit trail. |
| GET | /health, /ready | Public | Liveness and readiness. |

### 7.7 Error contract
Every error returns a machine-readable code, a human-readable message, optional field details and a request identifier. Standard classes: validation, unauthenticated, forbidden, not found, conflict (such as slot full or invalid state), rate limited, and internal. Internal errors never expose stack traces or internal identifiers.

## 8. Security Requirements

| Area | Requirement |
|---|---|
| Passwords | Modern slow hash (Argon2id preferred); minimum strength policy; breach list check if feasible. |
| Tokens | Short-lived access token (about 15 minutes); rotating refresh token stored hashed server-side, delivered as a secure httpOnly cookie; reuse of an old refresh token revokes the session family. |
| Authorization | Role and society checks on every endpoint; resident unit check on every parcel read. Automated tests for cross-society and cross-resident access. |
| Input | Validate every request body, query and parameter; reject unknown fields. |
| Rate limits | Strict limits on login, forgot-password, OTP generation and verification, invite acceptance. |
| Transport | HTTPS only; secure headers; CORS limited to the known web origin. |
| Secrets | Held in a secrets manager; never in the repository; separate per environment. |
| Images | Private storage; short-lived signed URLs; metadata stripped. |
| Logging | No passwords, tokens, OTPs or full phone numbers in logs; mask personal data. |
| Audit | Append-only; includes support access by platform admins. |
| Privacy | Collect minimum data; consent captured at onboarding; retention and deletion procedures defined; breach response runbook. |
| Dependencies | Automated vulnerability scanning in CI. |

## 9. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | 95th percentile under 500 ms for list and detail endpoints; booking under 1 second; first meaningful screen under 3 seconds on mid-range Android over 4G. |
| Reliability | Graceful degradation: if push fails, in-app notifications still work; if storage is slow, parcel registration can proceed without a photo when the society setting allows. |
| Offline | Reception registration queues locally when offline and syncs with idempotency keys; the UI clearly shows queued items. Other roles show cached read-only data where useful. |
| Scalability | Stateless API instances behind a load balancer; indexes designed for society-scoped queries; ready for multiple societies without schema change. |
| Maintainability | Module boundaries per domain; shared types; lint and format enforced; coverage target for critical logic (state machine, booking, OTP, permissions) near complete. |
| Observability | Request identifiers on every log and error; metrics for job queue depth, notification failures, booking conflicts, OTP failures. |
| Backup and recovery | Daily backups; restore tested before pilot; target recovery point of under 24 hours (tighten if point-in-time recovery available) and recovery time under 4 hours. |
| Browser support | Latest two versions of Chrome, Safari, Edge, Firefox; Android Chrome priority. |
| Localization | All user-facing text externalised; dates and times in society timezone. |

## 10. Testing Requirements

| Level | Scope |
|---|---|
| Unit | State transition table (every allowed and disallowed pair), slot availability and cutoff logic, OTP expiry, attempts and regeneration, permission matrix, idempotency handling. |
| Integration | Parcel registration and duplicate handling, booking and reschedule with counts, audit rows written atomically, outbox creation, job idempotency, tenant isolation. |
| Concurrency | Parallel bookings on the last seat; parallel OTP attempts; double submission of registration. |
| End to end | Full lifecycle from registration to delivery; failed delivery and reschedule; self-pickup; unclaimed flow; invite and approval; override flow. |
| Security | Cross-tenant and cross-resident access attempts, token reuse, rate limiting, upload abuse. |
| Non-functional | Low-bandwidth and offline behaviour for reception; accessibility checks; basic load test at pilot peak with margin. |
| Acceptance | Scripted pilot scenarios run with real staff before go-live. |

## 11. Environments and Delivery

| Environment | Purpose | Data |
|---|---|---|
| Local | Development | Seed data for a demo society. |
| Staging | Integration, QA, demos | Synthetic data only. |
| Production | Pilot and beyond | Real data, restricted access. |

- Every pull request runs lint, type check, unit and integration tests, and a migration check.
- Staging deploys automatically from the main branch; production deploys by manual approval.
- Database migrations are forward-only, reviewed, and applied before the new application version starts; destructive changes use a two-step approach.
- Feature flags control optional features such as live executive updates.

## 12. Data Retention (proposed defaults, to be confirmed with the society and counsel)

| Data | Default retention |
|---|---|
| Parcel photos | 90 days after the parcel reaches a terminal state |
| Handover proof photos | 180 days |
| Audit logs | 2 years |
| Notifications | 90 days |
| OTP challenges | 7 days after expiry |
| Ended resident memberships and user data | Per society policy and applicable law |

## 13. Work Breakdown and Estimates

Estimates assume two developers. Solo work should expect about one and a half times as long.

| Phase | Weeks | Key technical deliverables |
|---|---|---|
| 0 Discovery | 1 | Observation, state machine sign-off, data model sign-off, repository, CI, environments. |
| 1 Foundation | 2 | Auth, invites, roles, society scoping, tenant isolation tests, schema and seed data. |
| 2 Society setup | 2 | Units, import, members, storage, slot templates, admin and resident shells. |
| 3 Reception | 2 | Parcel registration, barcode scan, photo upload, QR, state machine core, audit, outbox and push. |
| 4 Scheduling | 2 | Slot instances, booking transaction, reschedule and cancel, task creation, assignment and pool mode. |
| 5 Delivery | 2 | Executive app, QR start, OTP, override, failure flow, pickup, unclaimed and reminder jobs. |
| 6 Hardening | 2 | Analytics, OpenAPI, security review, load and concurrency tests, accessibility, runbooks. |

## 14. Open Technical Questions
1. Which India-region host for the API and database (cost, managed backups, point-in-time recovery)?
2. Is a native wrapper needed for reliable push on iOS, or is an installed PWA acceptable for the pilot?
3. Printer support for QR labels at the desk, or on-screen QR only?
4. Does the pilot society require SMS for residents without app access?
5. Identity verification method for self-pickup when the resident lacks the app (government ID check, OTP by phone)?

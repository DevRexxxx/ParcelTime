# ParcelTime — Codebase Implementation Registry & Version History

> **Document Version:** 2.0.2  
> **Last Synchronized:** 2026-11-09  
> **Repository:** [DevRexxxx/ParcelTime](https://github.com/DevRexxxx/ParcelTime.git)  
> **Compliance:** Technical Requirements Document (TRD), Product Requirements Document (PRD), System Design Rules, and 2030 Spatial Design System.

---

## 📋 Governance & Synchronization Protocol

This document serves as the **Single Source of Truth (SSoT)** for all architectural implementations, database models, business logic modules, API contracts, background jobs, test suites, and UI components built in the ParcelTime monorepo.

### 🔄 Synchronization Rules
1. **Mandatory Dual-Update on Changes:** Whenever a major, minor, or patch release is implemented:
   - This document (`IMPLEMENTATIONS.md`) **must** be updated with the technical specifications, affected files, schemas, and endpoints.
   - `README.md` **must** be updated to reflect the new version badge, release summary, and updated version history section.
   - Package descriptors (`package.json`, `apps/web/package.json`, `apps/api/package.json`, `packages/shared/package.json`) **must** have their version numbers incremented in unison.
2. **Semantic Versioning Standard (`MAJOR.MINOR.PATCH`):**
   - **`MAJOR` (e.g., 1.0.0 → 2.0.0):** Breaking architectural changes, redesign of core design systems (e.g., 2030 Spatial UI), or major database schema restructurings.
   - **`MINOR` (e.g., 2.0.0 → 2.1.0):** New end-to-end features, new background workers, additional role consoles, or new API domain modules without breaking backwards compatibility.
   - **`PATCH` (e.g., 2.0.0 → 2.0.1):** Bug fixes, performance optimizations, security hardening, or non-breaking cosmetic refinements.

---

## 📜 Complete Version History

### [v2.0.2] — 2026-11-09 (Current Production Release)
#### 🚀 Spatial QR Label Engine, Barcode Laser Sentinel & Persona Orchestration
- **Physical QR Label Badge Engine:** Built [`QrBadgeModal.tsx`](file:///d:/Projects/ParcelTime/apps/web/src/components/modals/QrBadgeModal.tsx) rendering authentic SVG QR matrix finder patterns, security custody tokens, vault shelf labels, and native `window.print()` triggers. Replaced legacy browser alerts in [`ReceptionView.tsx`](file:///d:/Projects/ParcelTime/apps/web/src/components/views/ReceptionView.tsx).
- **Optical Barcode Laser Simulation:** Added realistic scanning beam animation and automated prefix recognition in [`RegisterParcelModal.tsx`](file:///d:/Projects/ParcelTime/apps/web/src/components/modals/RegisterParcelModal.tsx).
- **Duplicate Tracking Sentinel:** Real-time validation preventing duplicate courier tracking numbers from being checked into society vaults.
- **Society Directory Typeahead:** Smart unit search dynamically resolving Unit, Tower, and Resident name with 1-click auto-fill.
- **Kiosk OTP Keypad & Auto-Fill:** Added touch-friendly spatial numeric keypad, rapid demo auto-fill, and attempt-limit error handling in [`VerifyOtpModal.tsx`](file:///d:/Projects/ParcelTime/apps/web/src/components/modals/VerifyOtpModal.tsx).
- **Persona-to-View Auto-Routing:** Role switcher in [`Header.tsx`](file:///d:/Projects/ParcelTime/apps/web/src/components/layout/Header.tsx) now seamlessly auto-switches views between Resident, Reception, Executive, and Admin consoles.
- **Zero-Warning Production Next.js Build:** Resolved ESLint browser globals configuration and pruned unused imports across 24 components.

---

### [v2.0.1] — 2026-11-09
#### 🔧 CI Lockfile Synchronization & GitHub Actions Hardening
- **Resolved Outdated Lockfile Error:** Synchronized `pnpm-lock.yaml` with root `package.json` devDependencies (`@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`), resolving the `ERR_PNPM_OUTDATED_LOCKFILE` CI pipeline failure.
- **Workflow Hardening:** Updated `.github/workflows/ci.yml` with explicit `pnpm install --frozen-lockfile` to enforce strict dependency immutability across CI runner environments.

---

### [v2.0.0] — 2026-11-08
#### 🌟 2030 Spatial Design System, Full Background Jobs, & Estate Governance Suite
- **Spatial UI & Bento Grid:** Built complete Apple VisionOS-inspired Spatial Design System in Next.js 14 App Router with pure black theme (`#0D0101`), subtle 6–8% grid texture, ambient neon glows (Orange `#FF5D00`, Purple, Blue), 24–32px rounded glass cards, and continuous rotating gradient border strokes.
- **14 Bento Grid Cards:**
  - `StatCard`: Telemetry for In Storage, Scheduled Slots, Out For Delivery, and 99.4% Delivery Success.
  - `ActiveDeliveryCard`: Real-time tracking of in-transit packages with courier details.
  - `OtpCard`: Instant handover code reveal with countdown.
  - `VoiceCard`: Spatial voice assistant visualizer with live waveform simulation.
  - `StorageCard`: Visual rack/locker capacity bar with occupancy gauges.
  - `ConversationStatsCard`: Live latency (42ms), token processing metrics, and streaming engine indicators.
  - `AiModelCard`: Interactive AI model selector (`ParcelAI Spatial 2.4`, `Logistics-4o Omni`, `Claude Logistics 3.5 Sonnet`).
  - `MemoryCard`: Active learned resident rules and preferences.
  - `RecentChatsCard`: Conversation switcher with timestamps and unread badges.
  - `FilesCard`: Attached shipping slips, proof photos, and custody certificates.
  - `KnowledgeBaseCard`: Fast semantic lookup of society delivery cutoff rules and bylaws.
  - `WorkspaceCard`: Active estate overview (Greenwood Palms, Tower B, Gate 1 Reception).
  - `PromptLibraryCard`: 1-click execution for high-speed operational prompts.
  - `SettingsCard`: Toggles for ambient neon glows, spatial audio cues, and push alerts.
- **Document Viewer & Audit Preview Modal:** Added `DocumentViewerModal` supporting zoom, cryptographic SHA-256 checksum verification, and Indian DPDP Act 2023 compliance notice.
- **Bulk Unit Onboarding:** Implemented `POST /society/units/import` supporting bulk CSV/delimited unit ingestion with automatic tower linking and row-level error reporting.
- **Rapid Reception Typeahead:** Implemented `GET /society/units/search` matching unit number, tower name, or resident name for <30-second parcel registration.
- **Notification Preferences & Device Tokens:** Implemented `POST /devices`, `DELETE /devices/:token`, `GET /notification-preferences`, and `PATCH /notification-preferences`.
- **Slot Capacity Override & Blocking:** Implemented `PATCH /slots/templates/:id` and `PATCH /slots/instances/:id` with automatic cascading cancellation of affected schedules.
- **Test Suite Expansion:** Added comprehensive test suite `features.test.ts`, bringing passing tests to **21/21 across 6 test suites**.

---

### [v1.5.0] — 2026-11-07
#### ⚙️ Background Automation & Asynchronous Worker Suite
- **Worker Suite Bootstrapping:** Initialized `pg-boss` and interval-based job processing wired to the API lifecycle in `apps/api/src/jobs/index.ts`.
- **Unclaimed Aging Job (`aging.job.ts`):** Scans storage vaults hourly, flags parcels past the society threshold (default: 7 days), and auto-transitions them to `UNCLAIMED`.
- **Slot Generator Job (`slot-generator.job.ts`):** Pre-generates daily slot instances from active templates across the 14-day scheduling horizon.
- **Reminder Job (`reminder.job.ts`):** Scans upcoming delivery windows and enqueues reminders for residents and delivery executives.
- **Outbox Dispatcher (`outbox.job.ts`):** Decoupled transaction outbox processor for in-app inbox and device token dispatch with exponential backoff retry.

---

### [v1.4.0] — 2026-11-06
#### 🔐 Zero-Trust Handover Engine & Cryptographic OTP Challenge
- **Cryptographic Keyed Hash:** Handover challenges store only SHA-256 keyed hash `hashOtp(parcelId, rawOtp)` in `HandoverChallenge`; raw OTP is never stored in plain text or logged.
- **Resident OTP Display:** Strict object-level permission ensuring OTP is accessible only to verified members of the parcel's unit.
- **Rate-Limiting & Lockout:** 5 maximum failed verification attempts before challenge locks; regeneration rate-limited to 3 per hour.
- **Controlled Staff Override:** Implemented `POST /tasks/:id/override` requiring mandatory coded reason, recipient name, and proof photo, automatically flagged in the audit log.

---

### [v1.3.0] — 2026-11-05
#### 📦 Inbound Parcel Reception & QR Resolution Engine
- **<30-Second Inbound Intake:** Barcode/tracking number ingestion, automatic courier detection, unit assignment, and storage vault allocation.
- **Unique Parcel Code & QR Tokens:** Generation of human-readable parcel codes (e.g., `PT-7621`) and opaque UUID QR tokens.
- **Self-Pickup Lifecycle:** Implemented `POST /parcels/:id/pickup-request`, `DELETE /parcels/:id/pickup-request`, and `POST /parcels/:id/pickup-complete` for resident counter pickups.
- **Storage Transfers:** Implemented `POST /parcels/:id/move-storage` with reason tracking.

---

### [v1.2.0] — 2026-11-04
#### 📅 Deterministic Slot Booking Engine & Concurrency Locking
- **Atomic Slot Reservation:** PostgreSQL transaction locking slot instance rows to prevent overbooking.
- **Cutoff Window Enforcement:** Slot booking, rescheduling, and cancellation automatically lock 2 hours prior to window start.
- **Atomic Rescheduling:** Supersedes prior booking and reallocates slot capacity in a single database transaction.
- **Task Generation:** Automatically creates corresponding `DeliveryTask` upon slot confirmation.

---

### [v1.1.0] — 2026-11-03
#### 🛡️ Multi-Tenant Platform & 5-Tier RBAC Security
- **Strict Role-Based Access Control:** Separation between `PLATFORM_ADMIN`, `SOCIETY_ADMIN`, `RECEPTION`, `DELIVERY_EXECUTIVE`, and `RESIDENT`.
- **Tenant Scoping:** Automatic society filtering across all database queries derived from authenticated session tokens.
- **Token Rotation:** Short-lived JWT access tokens (15m) paired with rotating refresh tokens stored as secure, HttpOnly cookies.
- **Append-Only Audit Trail:** Centralized audit logger recording actor, event type, previous/new status, IP/request ID, and metadata.

---

### [v1.0.0-MVP] — 2026-11-01
#### 🚀 Initial Monorepo Architecture & State Machine Foundation
- Monorepo setup with Turborepo, pnpm workspaces, and strict TypeScript.
- Prisma schema with 17 relational entities and enums.
- Finite parcel state machine defining 11 states and 16 legal transitions.
- Demo seed script for Greenwood Palms Residences (`pnpm db:seed`).

---

## 🧩 Architectural Implementation Details

### 1. Monorepo Structure
```
ParcelTime/
├── apps/
│   ├── api/                       # Express 4 REST API, Prisma ORM, background jobs
│   └── web/                       # Next.js 14 App Router, Tailwind CSS, Framer Motion
├── packages/
│   └── shared/                    # Zero-drift validation schemas, enums, DTO types
├── docs/                          # PRD, TRD, Architecture, System Design Rules
├── IMPLEMENTATIONS.md             # This comprehensive implementation registry
└── README.md                      # Public project documentation & quickstart
```

### 2. State Machine Invariants
The parcel state machine is enforced exclusively through a single entry point:
- **Statuses (11):** `RECEIVED`, `IN_STORAGE`, `SCHEDULED`, `ASSIGNED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`, `UNCLAIMED`, `RETURNED_TO_COURIER`, `PICKUP_REQUESTED`, `PICKED_UP`.
- **Terminal Statuses (3):** `DELIVERED`, `CANCELLED`, `RETURNED_TO_COURIER`. Once reached, no further transitions are legally permitted.
- **Audit Requirement:** Every state transition executes within a database transaction alongside an append-only `AuditLog` row.

### 3. API Module Registry (`/api/v1`)
| Domain | Mount Path | Key Operations |
|---|---|---|
| **Health** | `/health` | Liveness (`/health`) and readiness checks |
| **Auth** | `/auth` | Login, refresh token rotation, logout, invite acceptance, society switching |
| **Society** | `/society` | Settings, towers, units, bulk import, typeahead search, invites, join requests |
| **Parcels** | `/parcels` | Registration, timeline, photo presigned URLs, QR resolution, storage moves, self-pickup |
| **Slots** | `/slots` | Templates, availability lookup, booking, rescheduling, cancellations, date blocks |
| **Tasks** | `/tasks` | Task run sheets, claiming, QR delivery start, OTP verification, failed attempts, overrides |
| **Notifications** | `/notifications` | Inbox list, mark read, device push tokens (`/devices`), category preferences |
| **Reports** | `/reports` | Dashboard metrics, volume summaries, CSV exports |
| **Audit** | `/audit-logs` | Immutable audit trail query with flagged override inspection |

---

## 🧪 Test Suite Coverage (100% Passing)

| Test File | Target Domain | Assertions |
|---|---|---|
| [`state-machine.test.ts`](file:///d:/Projects/ParcelTime/apps/api/src/test/state-machine.test.ts) | Parcel State Transitions | Validates all legal transitions and rejects invalid state mutations |
| [`concurrency.test.ts`](file:///d:/Projects/ParcelTime/apps/api/src/test/concurrency.test.ts) | Slot Capacity Locking | Proves that parallel bookings against a single seat produce exactly 1 success |
| [`otp.test.ts`](file:///d:/Projects/ParcelTime/apps/api/src/test/otp.test.ts) | Keyed SHA-256 OTP Challenge | Validates hash verification, expiration checks, and wrong attempt increments |
| [`tenant-isolation.test.ts`](file:///d:/Projects/ParcelTime/apps/api/src/test/tenant-isolation.test.ts) | Cross-Tenant Security | Ensures users cannot access parcels or units outside their active society |
| [`schemas.test.ts`](file:///d:/Projects/ParcelTime/apps/api/src/test/schemas.test.ts) | Shared Runtime Contracts | Tests Zod validations for registration, bookings, and overrides |
| [`features.test.ts`](file:///d:/Projects/ParcelTime/apps/api/src/test/features.test.ts) | Bulk Import, Devices, Overrides | Tests bulk unit parsing, device push registration, and slot blocking schemas |


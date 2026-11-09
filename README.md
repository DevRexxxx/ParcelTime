<p align="center">
  <div align="center">
    <div style="width: 80px; height: 80px; border-radius: 24px; background: linear-gradient(135deg, #FF5D00 0%, #FF8C38 100%); display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 0 35px rgba(255, 93, 0, 0.45);">
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    </div>
  </div>
</p>

<h1 align="center">ParcelTime</h1>

<p align="center">
  <strong>A futuristic residential parcel management and scheduled-delivery intelligence platform for modern gated communities.</strong><br/>
  <em>"Instead of adapting your schedule to your parcel, your parcel adapts to your schedule."</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.4-FF5D00?style=flat-square" alt="Version 2.0.4" />
  <img src="https://img.shields.io/badge/monorepo-turborepo-blue?style=flat-square&logo=turborepo" alt="Turborepo" />
  <img src="https://img.shields.io/badge/next.js-14-black?style=flat-square&logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/react-18-61dafb?style=flat-square&logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/express-4-000000?style=flat-square&logo=express" alt="Express 4" />
  <img src="https://img.shields.io/badge/prisma-5-2D3748?style=flat-square&logo=prisma" alt="Prisma 5" />
  <img src="https://img.shields.io/badge/postgresql-16-336791?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/typescript-5-3178c6?style=flat-square&logo=typescript" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/framer--motion-11-black?style=flat-square&logo=framer" alt="Framer Motion" />
</p>

---

## ✨ Overview

**ParcelTime** solves the ubiquitous last-mile parcel friction in modern gated communities, apartment complexes, and managed properties in India. 

Every day, couriers flood residential gates with parcels marked *"arriving today"*, leaving residents stranded at work or unavailable. Security desks become cluttered storage rooms without chain-of-custody accountability, while couriers waste hours making repeated, failed delivery attempts.

**ParcelTime** establishes an end-to-end, digital chain of custody:
1. Reception staff receive and register eligible parcels in under **30 seconds** via barcode scanning.
2. Parcels are safely assigned to designated society storage vaults (lockers, shelves, counter bays).
3. Residents are immediately notified via in-app & push alerts and choose an exact **delivery time window** that fits their day.
4. Internal delivery executives fulfill the scheduled run and complete a **zero-trust handover** using a cryptographic **6-digit OTP challenge**.
5. Every physical transition is permanently recorded in an **append-only audit log**.

---

## 📺 Key Highlights

- 🧠 **Spatial 2030 Bento Grid Dashboard** — Real-time operations telemetry: active transit pipeline, vault capacity gauges, live courier feeds, and resident memory.
- ⚡ **Autonomous AI Concierge** — Natural language assistant with an animated neon gradient border input; schedule packages, query status, or retrieve OTPs conversationally.
- ⏱️ **Fast Inbound Registration (<30s)** — Barcode/QR scan simulation, tower-unit autocomplete, recipient matching, and instant QR label generation.
- 📅 **Deterministic Slot Booking Engine** — Configurable society scheduling horizon (14 days), dynamic capacity caps, atomic slot reservations, and automated 2-hour cutoff rule enforcement.
- 🔐 **Zero-Trust Handover Verification** — 6-digit SHA-256 hashed OTP challenge with 15-minute validity, 5-attempt rate-limiting, and staff override safety protocols.
- 🚚 **Delivery Executive Operations** — Claimable society task pool, QR scan verification to initiate delivery runs, and celebratory confetti upon verified OTP handover.
- 🛡️ **Strict State Machine & Audit Trail** — Immutable custody history tracking every actor, timestamp, verification method, and status transition.
- 👥 **5-Tier Role-Based Security** — Granular separation of concerns for Platform Admins, Society Admins, Reception Guards, Delivery Executives, and Residents.

---

## 🏗️ Architecture

ParcelTime is architected as a high-performance **TypeScript monorepo** managed with **Turborepo** and **pnpm workspaces**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Client Layer (apps/web)                                │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │  Spatial AI Concierge │  │ Bento Grid Dashboard │  │  Role Consoles   │  │
│  │ (Framer Motion, Chat) │  │  (Telemetry & Audio) │  │(Resident/Guard)  │  │
│  └───────────────────────┘  └──────────────────────┘  └──────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST / JSON (JWT Session + Cookies)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                        API Layer (apps/api)                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Auth & RBAC  │  │ Parcel Core  │  │ Slot Engine  │  │ Task & Handover │  │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  ├─────────────────┤  │
│  │Notification  │  │ Society Mgmt │  │ Audit Trail  │  │ Reports & Stats │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────────┘  │
└───────────────────┬─────────────────────────────────────┬───────────────────┘
                    │ Type-Safe Contracts                 │ Prisma ORM
┌───────────────────▼───────────────────────┐  ┌──────────▼───────────────────┐
│     Shared Contracts (packages/shared)    │  │       PostgreSQL Database    │
│  • Zod Validation Schemas                 │  │  • Tenant Row-Level Security │
│  • Enums (States, Roles, Methods)         │  │  • Partial Unique Constraints│
│  • API DTOs & Error Types                 │  │  • Append-Only Audit Logs    │
└───────────────────────────────────────────┘  └──────────────────────────────┘
```

### Communication & Data Flow

| From | To | Protocol / Mechanism | Purpose |
|---|---|---|---|
| **Web Client** | **API Gateway** | REST / JSON over HTTP (`/api/v1`) | User actions, scheduling, OTP verification, parcel registration |
| **API Layer** | **PostgreSQL** | Prisma Client (Connection Pool) | Relational persistence, atomic slot transactions, audit trail |
| **Both Layers** | **Shared Package** | Direct TypeScript Imports (`workspace:*`) | Shared runtime validation (Zod) and type contracts |
| **API Layer** | **Background / Outbox** | Outbox Event Queue (`OutboxEvent`) | Decoupled push notifications (FCM) and courier webhook ingest |

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | **Next.js 14** (App Router) + **React 18** | Spatial UI, server rendering, client interactive state |
| **Styling & Design** | **Tailwind CSS 3.4** + Custom CSS | Glassmorphism, neon lighting, animated gradient strokes |
| **Animations** | **Framer Motion 11** | Floating cards, wave ripples, layout transitions, modal reveals |
| **Icons & Effects** | **Lucide React** + **Canvas Confetti** | Minimalist outlined iconography and delivery celebrations |
| **Backend Framework** | **Node.js** + **Express 4** | Versioned REST API (`/api/v1`), middleware pipeline |
| **Database & ORM** | **PostgreSQL** + **Prisma ORM 5** | Schema migrations, relations, connection pooling |
| **Validation** | **Zod 3.22** | Shared runtime input parsing on client and server |
| **Security & Auth** | **Argon2id** + **JWT** (Access + Refresh) | Password hashing, stateless tokens, role guards |
| **Testing** | **Vitest 1.3** | Blazing-fast unit and state machine test runner |
| **Monorepo Tooling** | **Turborepo** + **pnpm 10** | Workspace dependency orchestration and cached builds |

---

## 📁 Project Structure

```
ParcelTime/
├── package.json                         # Monorepo root scripts & dev dependencies
├── pnpm-workspace.yaml                  # pnpm workspace package definitions
├── turbo.json                           # Turborepo task pipeline configuration
├── tsconfig.base.json                   # Shared TypeScript compiler options
├── .eslintrc.json                       # Linting configuration
├── .prettierrc                          # Formatting rules
├── .gitignore                           # Git ignore rules
│
├── 01_PRD.md                            # Product Requirements Document
├── 02_TRD.md                            # Technical Requirements Document
├── 03_Architecture.md                   # System Architecture Blueprint
├── 04_MVP_Screens.md                    # Screen & User Interface Specifications
├── 05_user_flows.md                     # Interaction & Custody State Flows
├── 06_system_design_rules.md            # Invariant Business & State Machine Rules
│
├── apps/
│   ├── api/                             # Backend Express REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma            # Full PostgreSQL data model
│   │   │   └── seed.ts                  # Database seed script (Society, Units, Users, Slots)
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   └── env.ts               # Environment variable validation (Zod)
│   │   │   ├── lib/
│   │   │   │   ├── errors.ts            # Normalized API error hierarchy
│   │   │   │   ├── logger.ts            # Structured logging (Winston)
│   │   │   │   └── prisma.ts            # Prisma Client singleton
│   │   │   ├── middleware/
│   │   │   │   ├── authenticate.ts      # JWT auth & Role-Based Access Control (RBAC)
│   │   │   │   ├── errorHandler.ts      # Global centralized error catcher
│   │   │   │   └── requestId.ts         # Distributed tracing correlation IDs
│   │   │   ├── modules/
│   │   │   │   ├── audit/               # Immutable custody logs (service, controller, router)
│   │   │   │   ├── auth/                # Login, refresh, invite acceptance, society switch
│   │   │   │   ├── health/              # Healthcheck & heartbeat probes
│   │   │   │   ├── notifications/       # User preferences & outbox dispatch
│   │   │   │   ├── parcels/             # Parcel registration, QR, custody moves, photo uploads
│   │   │   │   ├── reports/             # Vault occupancy, slot stats, executive analytics
│   │   │   │   ├── slots/               # Slot generation, booking, cutoff, atomic rescheduling
│   │   │   │   ├── society/             # Towers, units, storage locations, invites
│   │   │   │   └── tasks/               # Delivery task assignment, OTP verification, failure
│   │   │   ├── test/
│   │   │   │   ├── otp.test.ts          # Cryptographic OTP validation tests
│   │   │   │   ├── schemas.test.ts      # Input contract validation tests
│   │   │   │   └── state-machine.test.ts# Invariant parcel state transition tests
│   │   │   ├── index.ts                 # Express HTTP server bootstrap
│   │   │   └── router.ts                # Master versioned API router (`/api/v1`)
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── web/                             # Frontend Spatial Next.js Application
│       ├── public/
│       │   └── manifest.json            # Web App Manifest (PWA capabilities)
│       ├── src/
│       │   ├── app/
│       │   │   ├── globals.css          # Design system, neon gradients, glass styles
│       │   │   ├── layout.tsx           # Ambient corner glows, grid texture, root shell
│       │   │   └── page.tsx             # Master client state machine & view orchestrator
│       │   ├── components/
│       │   │   ├── bento/
│       │   │   │   ├── ActiveDeliveryCard.tsx  # In-transit delivery progress tracker
│       │   │   │   ├── BentoGrid.tsx           # Adaptive 2030 spatial bento container
│       │   │   │   ├── OtpCard.tsx             # Handover code reveal with countdown ring
│       │   │   │   ├── StatCard.tsx            # Glowing micro-stat cards
│       │   │   │   ├── StorageCard.tsx         # Storage vault capacity progress meters
│       │   │   │   └── VoiceCard.tsx           # Spatial audio waveform visualizer
│       │   │   ├── chat/
│       │   │   │   ├── ChatArea.tsx            # Floating message stream container
│       │   │   │   ├── ChatInput.tsx           # Animated rotating gradient border input
│       │   │   │   └── MessageBubble.tsx       # Glass message cards with embedded actions
│       │   │   ├── layout/
│       │   │   │   ├── Header.tsx              # Society title, model switcher, role pill
│       │   │   │   ├── MobileNav.tsx           # Floating glass bottom navigation
│       │   │   │   └── Sidebar.tsx             # Collapsible spatial sidebar
│       │   │   ├── modals/
│       │   │   │   ├── RegisterParcelModal.tsx # Express check-in (<30s) with barcode scan
│       │   │   │   ├── ScheduleSlotModal.tsx   # Date & delivery window picker
│       │   │   │   └── VerifyOtpModal.tsx      # Courier keypad verification with confetti
│       │   │   └── views/
│       │   │       ├── AdminView.tsx           # Governance policy & append-only audit trail
│       │   │       ├── ExecutiveView.tsx       # Shift tasks, pool claiming, QR verification
│       │   │       ├── ReceptionView.tsx       # Working desk, search, storage management
│       │   │       └── ResidentView.tsx        # Active parcels, slot history, pickup request
│       │   ├── lib/
│       │   │   ├── mockData.ts          # Realistic seed data for offline / preview mode
│       │   │   ├── types.ts             # Client UI models & persona definitions
│       │   │   └── utils.ts             # Status badge color helpers, string formatters
│       │   ├── next.config.js
│       │   ├── postcss.config.js
│       │   ├── tailwind.config.js
│       │   └── package.json
│       │
└── packages/
    └── shared/                          # Zero-drift Shared Contracts
        ├── src/
        │   ├── api-types.ts             # API DTO contracts
        │   ├── enums.ts                 # State machine, role, and method enumerations
        │   ├── index.ts                 # Barrel exports
        │   └── schemas.ts               # Shared Zod validation schemas
        ├── tsconfig.json
        └── package.json
```

---

## 🚀 Features & Invariant Rules

### 📦 Parcel State Machine

ParcelTime strictly enforces an immutable state machine where **parcel status lives solely on the parcel record**, ensuring a single source of truth:

| Status | Meaning | Permitted Transitions |
|---|---|---|
| `RECEIVED` | Logged at reception, held in society storage vault | `SCHEDULED`, `CANCELLED` |
| `SCHEDULED` | Resident reserved an active delivery time window | `ASSIGNED`, `RECEIVED` (reschedule/cancel) |
| `ASSIGNED` | Internal courier assigned (or claimed from pool) | `OUT_FOR_DELIVERY`, `SCHEDULED` (unassign) |
| `OUT_FOR_DELIVERY` | Executive physically collected parcel from vault | `DELIVERED`, `RECEIVED` (returned on failure) |
| `DELIVERED` | Handover completed with verified OTP (**Terminal**) | *None (Terminal state)* |
| `CANCELLED` | Registration voided by admin/guard (**Terminal**) | *None (Terminal state)* |
| `UNCLAIMED` | Exceeded society threshold without booking (e.g. 7 days) | `SCHEDULED`, `RETURNED_TO_COURIER` |
| `RETURNED_TO_COURIER` | Returned to original logistics provider (**Terminal**) | *None (Terminal state)* |

> 🔒 **Terminal Integrity Rule**: A parcel in `DELIVERED`, `CANCELLED`, or `RETURNED_TO_COURIER` can **never** be reopened. Administrative corrections require an audited note, never status alteration.

---

### ⏰ Slot & Capacity Booking Engine

1. **Database-Level Capacity**: Enforced inside an atomic PostgreSQL transaction. If two residents book the final slot simultaneously, exactly one succeeds and the other receives an immediate, clear *"slot just filled"* response.
2. **Cutoff Policy**: Slots close for booking, rescheduling, and cancellation a configurable number of hours prior to start (default **2 hours**).
3. **Atomic Reschedule**: The previous slot capacity is released and the new slot is reserved within a single database transaction, or neither changes.
4. **Timezone Awareness**: All schedule calculations use Indian Standard Time (`Asia/Kolkata`), while internal storage timestamps are strictly stored in UTC.

---

### 🔑 Zero-Trust OTP Security Protocol

1. **Cryptographic Hashing**: Plaintext OTPs are **never** stored in the database. Only a keyed SHA-256 hash (`hashOtp(parcelId, rawOtp)`) is persisted.
2. **Resident-Only Visibility**: The 6-digit PIN is displayed only in the Resident portal. It is inaccessible to guards, delivery personnel, or administrators.
3. **Short Expiry & Lockout**: OTPs expire after 10–15 minutes. After **5 failed attempts**, the challenge permanently locks, requiring the resident to trigger a rate-limited re-generation.
4. **Single-Use Consumption**: A verified OTP immediately marks the challenge `VERIFIED` and sets the parcel to terminal `DELIVERED`.

---

### 👥 5-Tier Role Personas

| Role | Scope | Capabilities |
|---|---|---|
| **PLATFORM_ADMIN** | Multi-Society | Global society provisioning, platform health, tenant oversight. |
| **SOCIETY_ADMIN** | Single Society | Tower/unit management, slot template configuration, user roles, override review, audit inspection. |
| **RECEPTION** | Single Society | Parcel check-in (<30s), storage moves, barcode printing, resident self-pickups, courier returns. |
| **DELIVERY_EXECUTIVE** | Single Society | View shift task list, claim pool parcels, scan QR to initiate run, verify handover OTP, record failure reasons. |
| **RESIDENT** | Own Units | View incoming packages, choose delivery window, reschedule, view live transit status, reveal handover OTP. |

---

## 🎨 2030 Spatial Design System

The user interface follows the **2030 Spatial Design System** — blending the spatial depth of Apple VisionOS, the keyboard-first speed of Raycast/Linear, and modern Bento Grid SaaS layouts:

### Design Tokens & Color Palette

```css
:root {
  --bg-pure-black:       #0D0101;    /* Deep obsidian pure black */
  --primary-orange:      #FF5D00;    /* High-contrast hyper-orange */
  --primary-glow:        rgba(255, 93, 0, 0.35);
  --accent-purple:       #9333EA;    /* Ambient violet glow */
  --accent-blue:         #3B82F6;    /* Spatial blue accent */
  --text-primary:        #FFFAFA;    /* Pure crisp white */
  --text-muted:          #A19999;    /* Low-fatigue secondary */
  --radius-card:         24px-32px;  /* Continuous spatial curvature */
}
```

### Key UI Signatures

- **Subtle Grid Texture**: An ultra-clean 40px grid pattern set at **6–8% opacity** across the viewport.
- **Ambient Radial Corner Glows**: Soft, multi-colored atmospheric backlights (Orange, Purple, Blue) anchored behind floating cards.
- **Glassmorphism Panels**: `backdrop-blur-2xl` glass with subtle 1px border strokes (`rgba(255, 255, 255, 0.08)`) and inset highlight speculars.
- **Animated Neon Gradient Input**: A rotating linear gradient stroke (`#FF5D00` → `#9333EA` → `#3B82F6`) moving continuously around the floating search/chat pill.
- **Celebratory Handover Confetti**: Integrated `canvas-confetti` fireworks upon successful OTP completion.

---

## 🔧 Installation & Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.18+ or v20+)
- [pnpm](https://pnpm.io/) (v10+ or v9+)
- [PostgreSQL](https://www.postgresql.org/) (v14+)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/YourOrg/ParcelTime.git
cd ParcelTime

# Install monorepo dependencies
pnpm install
```

### 2. Configure Environment Variables

Create `.env` inside `apps/api/.env`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/parceltime?schema=public"
JWT_ACCESS_SECRET="supersecretjwtaccesskeymin32charslong!"
JWT_REFRESH_SECRET="supersecretjwtrefreshkeymin32charslong!"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="30d"
WEB_ORIGIN="http://localhost:3000"
```

### 3. Database Migration & Seeding

```bash
# Generate Prisma Client
pnpm --filter @parceltime/api run db:generate

# Run migrations (or push schema)
pnpm --filter @parceltime/api run db:migrate

# Seed Greenwood Palms society, units, slots, parcels & accounts
pnpm --filter @parceltime/api run db:seed
```

### 4. Run Development Servers

```bash
# Run both Next.js Web App and Express API concurrently via Turbo
pnpm dev
```

- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:3001/api/v1`

---

## 🧪 Testing & Verification

Run automated test suites, typecheckers, and production builds across all packages:

```bash
# Run Vitest test suites (State machine, OTP hashing, Zod schemas)
pnpm test

# Run TypeScript typecheck across all workspace packages
pnpm typecheck

# Run production build for all packages (shared, api, web)
pnpm build
```

---

## 📡 API Overview (`/api/v1`)

All endpoints require JWT Bearer authorization, except public `/health` and `/auth/login` routes:

### Authentication & Identity (`/auth`)

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/auth/login` | `POST` | Public | Authenticate via email or phone + password; returns access token + sets HTTP-only refresh cookie. |
| `/auth/refresh` | `POST` | Public | Rotate refresh token and issue fresh access token. |
| `/auth/logout` | `POST` | Authenticated | Invalidate refresh cookie. |
| `/auth/accept-invite` | `POST` | Public | Accept an invitation token, setup credentials, activate society role. |
| `/auth/switch-society`| `POST` | Authenticated | Switch active tenant society context and receive new token pair. |
| `/auth/me` | `GET` | Authenticated | Retrieve active user profile, memberships, and linked units. |

### Parcel Operations (`/parcels`)

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/parcels` | `POST` | Reception, Admin | Register inbound package (<30s) with courier, tracking ID, unit, and vault location. |
| `/parcels` | `GET` | Authenticated | Filter parcels by status, unit, date with pagination. |
| `/parcels/:id` | `GET` | Authenticated | Retrieve complete parcel record with active schedule. |
| `/parcels/:id/schedule` | `POST` | Resident, Admin | Book a delivery time window for an in-storage parcel. |
| `/parcels/:id/handover-otp` | `POST` | Resident | Retrieve/regenerate the 6-digit handover challenge code. |
| `/parcels/:id/move-storage` | `POST` | Reception, Admin | Transfer parcel to a different storage location. |
| `/parcels/:id/pickup-request` | `POST` | Resident | Request self-pickup at the reception desk. |
| `/parcels/:id/pickup-complete`| `POST` | Reception, Admin | Verify resident identity and mark parcel `DELIVERED`. |
| `/parcels/:id/return-to-courier` | `POST` | Reception, Admin | Hand parcel back to courier with logged reason. |

### Society & Unit Management (`/society`)

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/society/units/search` | `GET` | Staff, Admin | Rapid typeahead lookup (<30s) matching unit, tower, or resident name. |
| `/society/units/import` | `POST` | Society Admin | Bulk onboarding of units from CSV/delimited data with validation report. |
| `/society/invites/:id/resend` | `POST` | Society Admin | Regenerate cryptographically secure invitation token and extend expiry. |

### Slots & Scheduling (`/slots`)

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/slots/templates` | `GET` / `POST` | Society Admin | List or create society delivery time windows and capacity caps. |
| `/slots/templates/:id` | `PATCH` | Society Admin | Update slot window timing, days, or capacity parameters. |
| `/slots/available` | `GET` | Authenticated | List open slots for a date with real-time cutoff status. |
| `/slots/instances/:id` | `PATCH` | Society Admin | Block slot date or override capacity (auto-cancels and notifies affected residents). |
| `/slots/:parcelId/reschedule` | `POST` | Resident, Admin | Atomically swap an existing schedule into a new slot. |
| `/slots/:parcelId/cancel` | `POST` | Resident, Admin | Cancel a scheduled delivery before the cutoff window. |

### Tasks & Verification (`/tasks`)

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/tasks` | `GET` | Executive, Admin | Query assigned or unassigned pool delivery tasks. |
| `/tasks/:id/claim` | `POST` | Executive | Claim an open task from the society pool. |
| `/tasks/:id/start` | `POST` | Executive | Scan parcel QR code to transition status to `OUT_FOR_DELIVERY`. |
| `/tasks/:id/verify-otp` | `POST` | Executive | Enter resident's 6-digit OTP to verify custody and complete delivery. |
| `/tasks/:id/fail` | `POST` | Executive | Report delivery failure (not at home, refused) and return parcel to vault. |
| `/tasks/:id/override` | `POST` | Admin, Reception | Staff override delivery with verified reason and recipient name. |

### Devices & Preferences (`/devices`, `/notification-preferences`)

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/devices` | `POST` | Authenticated | Register FCM / Web Push device token for live notifications. |
| `/devices/:token` | `DELETE` | Authenticated | Unregister inactive device token. |
| `/notification-preferences` | `GET` / `PATCH` | Authenticated | Query or toggle granular per-category alert preferences. |

---

## 📜 Version History

ParcelTime follows [Semantic Versioning](https://semver.org/). For complete technical details, code changes, and synchronization protocols, see [`IMPLEMENTATIONS.md`](file:///d:/Projects/ParcelTime/IMPLEMENTATIONS.md).

| Version | Release Date | Key Implementations & Highlights |
|---|---|---|
| **`v2.0.4`** | 2026-11-09 | **Monorepo Package Resolution & Runtime Packaging Hardening:** Resolved Node.js runtime resolution failure (`ERR_MODULE_NOT_FOUND`) on `/app/packages/shared/src/enums` by updating `@parceltime/shared` `package.json` to point `"main"` and `"types"` to compiled `dist/` artifacts with dual CJS/ESM exports map; verified `argon2` prebuilt native binaries; synchronized and validated `pnpm-lock.yaml` for zero-failure GitHub Actions CI (`pnpm install --frozen-lockfile`). |
| **`v2.0.3`** | 2026-11-09 | **Spec v2 UI/UX Hardening & Zero-Trust Security Audit Alignment:** Fixed critical findings from [`09_ui_fix_and_build_spec.md`](file:///d:/Projects/ParcelTime/09_ui_fix_and_build_spec.md); purged insecure code delegation memory; eliminated plain OTP text from AI chat bubbles and exports in favor of interactive `OTP_ACTION` buttons; removed code copy buttons with safety lines; unified resident unit to A-102 (Tower A - Aspen) across all mock data; purged deferred smart locker references; pruned staff prompts from resident suggestion chips; decoupled 15-card Bento from ChatArea for focused conversational stream; role-aware dynamic sidebar and mobile navigation. |
| **`v2.0.2`** | 2026-11-09 | **Spatial QR Label Engine, Optical Barcode Laser Sentinel & Persona Orchestration:** Physical QR label badge modal ([`QrBadgeModal.tsx`](file:///d:/Projects/ParcelTime/apps/web/src/components/modals/QrBadgeModal.tsx)) with SVG QR matrix & native printing, animated optical barcode laser simulation, society directory typeahead auto-fill, duplicate tracking code sentinel, touch kiosk numeric keypad ([`VerifyOtpModal.tsx`](file:///d:/Projects/ParcelTime/apps/web/src/components/modals/VerifyOtpModal.tsx)), and automatic persona-to-view navigation on role change. Zero-warning Next.js production build. |
| **`v2.0.1`** | 2026-11-09 | **CI Lockfile Synchronization & Workflow Hardening:** Synchronized `pnpm-lock.yaml` with root `devDependencies` (`@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`) and enforced `pnpm install --frozen-lockfile` in GitHub Actions CI pipeline. |
| **`v2.0.0`** | 2026-11-08 | **2030 Spatial Design System & AI Concierge:** Next.js 14 App Router with Pure Black (`#0D0101`) theme, animated gradient border chat box, 14 Bento Grid spatial cards (Conversation stats, AI model selector, active memory, recent chats, files, knowledge base, workspace, prompt library, settings), Document Viewer & PDF preview modal, Bulk CSV unit onboarding, rapid typeahead search, notification preferences & device push tokens, and 21 passing test suites. |
| **`v1.5.0`** | 2026-11-07 | **Background Automation & Asynchronous Jobs:** `pg-boss` worker suite for unclaimed aging job, daily slot instance generation, delivery window reminders, and outbox push notification dispatcher. |
| **`v1.4.0`** | 2026-11-06 | **Zero-Trust Handover Engine:** Cryptographic keyed SHA-256 OTP challenges (`hashOtp`), 15-minute validity, 5-attempt rate-limiting, and controlled staff overrides with photo proof. |
| **`v1.3.0`** | 2026-11-05 | **Inbound Parcel Reception:** <30-second barcode intake, storage vault placement, QR token generation/resolution, and self-pickup counter request lifecycle. |
| **`v1.2.0`** | 2026-11-04 | **Deterministic Slot Booking Engine:** Concurrency row-locking for capacity integrity, atomic rescheduling, 2-hour cutoff rule enforcement, and automated task generation. |
| **`v1.1.0`** | 2026-11-03 | **Multi-Tenant Platform & 5-Tier RBAC:** Strict separation across Platform Admin, Society Admin, Reception, Executive, and Resident roles; rotating refresh tokens; append-only audit trail. |
| **`v1.0.0-MVP`** | 2026-11-01 | **Foundation & State Machine:** Turborepo monorepo setup, 17 relational Prisma entities, 11-state parcel machine with 16 transitions, and Greenwood Palms demo seed data. |

---

## 📝 Demo Seed Accounts

The database seed (`pnpm db:seed`) provides test accounts configured for **Greenwood Palms Residences**:

| Role | Email | Password | Context |
|---|---|---|---|
| **Resident** | `priya.sharma@gmail.com` | `ParcelTime@2026` | Unit A-102 (Owner) • Has active and in-transit parcels |
| **Delivery Executive** | `rajesh.exec@greenwood.in` | `ParcelTime@2026` | Active shift courier • Assigned task PT-7621 |
| **Reception Staff** | `reception@greenwood.in` | `ParcelTime@2026` | Gate 1 Concierge Desk • Fast register & vault access |
| **Society Admin** | `admin@greenwood.in` | `ParcelTime@2026` | Estate Manager • Governance, slot templates, audit trail |
| **Platform Admin** | `platform@parceltime.in` | `ParcelTime@2026` | Multi-society headquarters governance |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/smart-locker-integration`)
3. Commit your changes (`git commit -m 'feat: add IoT locker unlock API'`)
4. Verify tests and types (`pnpm typecheck && pnpm test`)
5. Push to your branch (`git push origin feature/smart-locker-integration`)
6. Open a Pull Request

---

<p align="center">
  <strong>Built with ❤️ for modern residential communities</strong><br/>
  <em>Your Parcel. Your Time. Your Convenience.</em>
</p>


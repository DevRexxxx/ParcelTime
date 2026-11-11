<p align="center">
  <a href="https://parceltimeweb-production.up.railway.app/" target="_blank">
    <img src="https://raw.githubusercontent.com/DevRexxxx/ParcelTime/main/docs/assets/hero-banner.jpg" alt="ParcelTime — Residential Logistics, Intelligently Managed" width="100%" style="border-radius: 16px; max-width: 100%;" />
  </a>
</p>

<h1 align="center">ParcelTime</h1>

<p align="center">
  <strong>Residential parcel management & scheduled-delivery intelligence for modern gated communities.</strong><br/>
  <em>"Instead of adapting your schedule to your parcel, your parcel adapts to your schedule."</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/v2.3.0-FF5D00?style=flat-square&label=version" alt="v2.3.0" />
  <img src="https://img.shields.io/badge/turborepo-blue?style=flat-square&logo=turborepo&label=monorepo" alt="Turborepo" />
  <img src="https://img.shields.io/badge/14-black?style=flat-square&logo=next.js&label=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/18-61dafb?style=flat-square&logo=react&label=react" alt="React 18" />
  <img src="https://img.shields.io/badge/4-000000?style=flat-square&logo=express&label=express" alt="Express 4" />
  <img src="https://img.shields.io/badge/5-2D3748?style=flat-square&logo=prisma&label=prisma" alt="Prisma 5" />
  <img src="https://img.shields.io/badge/16-336791?style=flat-square&logo=postgresql&label=postgresql" alt="PostgreSQL 16" />
  <img src="https://img.shields.io/badge/5-3178c6?style=flat-square&logo=typescript&label=typescript" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/3.4-38bdf8?style=flat-square&logo=tailwindcss&label=tailwind" alt="Tailwind 3.4" />
  <img src="https://img.shields.io/badge/11-black?style=flat-square&logo=framer&label=framer motion" alt="Framer Motion 11" />
</p>

<p align="center">
  <a href="https://parceltimeweb-production.up.railway.app/" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-parceltimeweb--production.up.railway.app-FF5D00?style=for-the-badge&logo=railway&logoColor=white" alt="Live Demo" />
  </a>
  <a href="https://parceltimeweb-production.up.railway.app/redesign.html" target="_blank">
    <img src="https://img.shields.io/badge/✨_Redesign_Prototype-redesign.html-22D3EE?style=for-the-badge&logo=figma&logoColor=white" alt="Redesign Prototype" />
  </a>
</p>

---

## The Problem

Every day, couriers flood residential gates with parcels marked _"arriving today"_. Residents are unavailable. Security desks become cluttered storage rooms with zero accountability. Couriers waste hours on repeated failed attempts. Nobody knows who has what, or when it will actually arrive.

**ParcelTime** closes that gap with an end-to-end digital chain of custody — from the moment a parcel arrives at the gate to the moment a resident signs off with a cryptographic OTP.

---

## How It Works

```
  Courier drops parcel at gate
            │
            ▼
  ┌─────────────────────┐
  │  Reception scans &   │ ◄── Barcode intake < 30 seconds
  │  registers parcel    │
  └──────────┬──────────┘
             │
             ▼
  ┌─────────────────────┐
  │  Assigned to vault   │ ◄── Locker / shelf / counter bay
  │  storage location    │
  └──────────┬──────────┘
             │
             ▼
  ┌─────────────────────┐
  │  Resident notified   │ ◄── Push / in-app alert
  │  & books time slot   │
  └──────────┬──────────┘
             │
             ▼
  ┌─────────────────────┐
  │  Executive delivers  │ ◄── QR scan → OUT_FOR_DELIVERY
  │  to resident's door  │
  └──────────┬──────────┘
             │
             ▼
  ┌─────────────────────┐
  │  OTP handover ✓      │ ◄── 6-digit code → DELIVERED
  │  Custody complete    │
  └─────────────────────┘
```

Every transition is permanently recorded in an **append-only audit log**.

---

## Core Capabilities

### 🔒 Zero-Trust Custody

- **Cryptographic OTP handover** — SHA-256 hashed, 15-minute expiry, 5-attempt lockout
- **Strict state machine** — 8 states, terminal integrity (DELIVERED / CANCELLED / RETURNED can never reopen)
- **Append-only audit trail** — every actor, timestamp, verification method, and transition is permanently logged

### 📦 Universal Shipment Ingestion Engine (USIE)

- **Multi-carrier tracking** — Delhivery, Blue Dart, Ekart, Amazon Logistics, Shiprocket
- **Gmail push discovery** — Deterministic parsing of Amazon / Flipkart dispatch emails
- **Webhook intake** — HMAC-SHA256 verified, durable `WebhookInbox` storage
- **Zero-Trust Custody Invariant** — Courier "delivered" strictly maps to `DELIVERED_TO_SOCIETY`, never `DELIVERED_TO_RESIDENT`
- **Cross-resident conflict detection** — Tracking numbers and order references cannot collide across residents
- **Bidirectional auto-linking** — Gate reception parcels ↔ tracked shipments, linked in both directions

### 📊 Smart Operations

- **Parcel consolidation** — Batch multiple packages for one unit into a single delivery run
- **Hybrid fulfillment** — Society-configurable: delivery-only, pickup-only, or hybrid
- **Intelligent slot scoring** — Same-unit consolidation (+50), tower clustering (+25), evening window (+15)
- **Pilot KPIs** — Consolidation rate, median dwell time, first-attempt handover success, intake speed

### 📱 Residential UI/UX Redesign (v2.3.0)

- **Plain Human Terminology** — Replaced speculative jargon with intuitive everyday words: **Home**, **Parcels**, **Schedule**, and **Assistant**.
- **Action-First Hierarchy** — Immediate, contextual card CTAs: **"Schedule delivery"** for gate-waiting parcels, and **"View OTP"** for in-transit parcels.
- **4-Step Labeled Progress Tracker** — Clear visual journey: `Arrived` → `Scheduled` → `Out for delivery` → `Delivered`, plus an animated live ETA strip for active runs.
- **Tap-to-Reveal OTP Bottom Sheet** — Shielded behind a blur toggle with a 5-minute expiry countdown, 15-second auto-blur timeout, and clipboard copy. Codes never leak into chat text.
- **Dual-Mode Responsive Layout** — Persistent left sidebar on desktop ($\ge 1024\text{px}$), strictly swapping to a touch-optimized bottom bar on mobile ($< 1024\text{px}$).
- **Dedicated Notification Drawer** — Replaces repetitive activity feeds with a clean slide-out drawer featuring unread badges and relative timestamps.
- **Interactive State Switcher** — Preview and test all 4 core UX states (Active Parcels, Loading Skeletons, Empty State, Error/Offline) on demand at [`/redesign.html`](https://parceltimeweb-production.up.railway.app/redesign.html).

### 👥 5-Tier Role Security

| Role | Scope | Key Capabilities |
|---|---|---|
| **Platform Admin** | All societies | Provisioning, platform health, tenant oversight |
| **Society Admin** | One society | Towers, units, slots, roles, audit, overrides |
| **Reception** | One society | Parcel check-in (< 30s), storage, pickups, returns |
| **Delivery Executive** | One society | Task claiming, QR scan, OTP verification, failure logging |
| **Resident** | Own units | View parcels, book slots, reschedule, reveal OTP |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Client Layer (apps/web)                          │
│  ┌────────────────────┐  ┌───────────────────┐  ┌───────────────────┐  │
│  │  AI Concierge      │  │  Bento Dashboard  │  │  Role Consoles    │  │
│  │  (Framer Motion)   │  │  (KPIs & Stats)   │  │  (5 views)        │  │
│  └────────────────────┘  └───────────────────┘  └───────────────────┘  │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │  REST / JSON (JWT + HTTP-only cookies)
┌──────────────────────────────────▼──────────────────────────────────────┐
│                         API Layer (apps/api)                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────────┐  │
│  │ Auth & RBAC│  │Parcel Core │  │Slot Engine │  │ Task & Handover  │  │
│  ├────────────┤  ├────────────┤  ├────────────┤  ├──────────────────┤  │
│  │Shipments   │  │Society Mgmt│  │Audit Trail │  │ Reports & KPIs   │  │
│  │(USIE)      │  │            │  │            │  │                  │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────────────────┘  │
└────────────────┬──────────────────────────────────┬─────────────────────┘
                 │  Type-safe contracts              │  Prisma ORM
┌────────────────▼──────────────────────┐  ┌────────▼─────────────────────┐
│   Shared Contracts (packages/shared)  │  │      PostgreSQL Database     │
│  • Zod schemas    • Enums (8+26)      │  │  • 28 models, 26 enums       │
│  • API DTOs       • Error types       │  │  • Row-level tenant security  │
└───────────────────────────────────────┘  │  • Append-only audit logs     │
                                           └──────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + React 18 | Spatial UI, SSR, client state management |
| **Styling** | Tailwind CSS 3.4 + glassmorphism CSS | Dark theme, neon gradients, animated borders |
| **Animations** | Framer Motion 11 | Floating cards, layout transitions, modal reveals |
| **Icons** | Lucide React + Canvas Confetti | Outlined iconography, handover celebrations |
| **Backend** | Node.js + Express 4 | REST API (`/api/v1`), middleware pipeline |
| **Database** | PostgreSQL 16 + Prisma 5 | 28 models, migrations, connection pooling |
| **Validation** | Zod 3.22 | Shared runtime parsing on client and server |
| **Auth** | bcryptjs + JWT (access + refresh) | Password hashing, stateless tokens, role guards |
| **Background** | pg-boss workers + outbox | Push notifications, aging jobs, slot generation |
| **Testing** | Vitest 1.6 | Unit, state machine, and integration tests |
| **Monorepo** | Turborepo + pnpm 10 | Workspace orchestration and cached builds |

---

## Parcel State Machine

Status lives solely on the parcel record — single source of truth, no split-brain:

| Status | Meaning | Transitions To |
|---|---|---|
| `RECEIVED` | Held in society storage vault | → `SCHEDULED`, `CANCELLED` |
| `SCHEDULED` | Resident reserved a delivery window | → `ASSIGNED`, `RECEIVED` |
| `ASSIGNED` | Courier assigned or claimed from pool | → `OUT_FOR_DELIVERY`, `SCHEDULED` |
| `OUT_FOR_DELIVERY` | Executive collected parcel from vault | → `DELIVERED`, `RECEIVED` |
| `DELIVERED` | OTP-verified handover ✓ | *Terminal* |
| `CANCELLED` | Registration voided | *Terminal* |
| `UNCLAIMED` | Exceeded storage threshold | → `SCHEDULED`, `RETURNED_TO_COURIER` |
| `RETURNED_TO_COURIER` | Returned to logistics provider | *Terminal* |

> **Terminal Integrity Rule** — `DELIVERED`, `CANCELLED`, and `RETURNED_TO_COURIER` can **never** be reopened. Administrative corrections require an audited note, never status alteration.

---

## OTP Security Protocol

| Property | Detail |
|---|---|
| **Storage** | Keyed SHA-256 hash only — plaintext never stored |
| **Visibility** | Resident portal only — invisible to guards, executives, admins |
| **Expiry** | 15 minutes |
| **Lockout** | 5 failed attempts → permanent lock, rate-limited regeneration |
| **Consumption** | Single-use — verified OTP immediately sets parcel to `DELIVERED` |

---

## Project Structure

```
ParcelTime/
├── apps/
│   ├── api/                          # Express REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # 28 models, 26 enums
│   │   │   └── seed.ts               # Greenwood Palms demo data
│   │   └── src/
│   │       ├── config/               # Zod env validation
│   │       ├── lib/                  # Prisma client, logger, errors
│   │       ├── middleware/           # JWT auth, RBAC, error handler, request ID
│   │       ├── integrations/
│   │       │   ├── gmail/            # OAuth2 dispatch email parser
│   │       │   └── tracking/         # Multi-carrier adapters & registry
│   │       ├── modules/
│   │       │   ├── audit/            # Immutable custody logs
│   │       │   ├── auth/             # Login, refresh, invite, society switch
│   │       │   ├── health/           # Heartbeat probes
│   │       │   ├── notifications/    # Outbox dispatch & preferences
│   │       │   ├── parcels/          # Registration, QR, custody, photos
│   │       │   ├── reports/          # KPIs, vault occupancy, analytics
│   │       │   ├── shipments/        # USIE matcher, normalizer, webhooks
│   │       │   ├── slots/            # Booking, cutoff, atomic reschedule
│   │       │   ├── society/          # Towers, units, storage, invites
│   │       │   └── tasks/            # Assignment, OTP verify, failure
│   │       └── test/                 # 8 test suites, 54 tests
│   │
│   └── web/                          # Next.js 14 Spatial UI
│       └── src/
│           ├── app/                  # Root layout, globals, page orchestrator
│           ├── components/
│           │   ├── bento/            # Dashboard stat & status cards
│           │   ├── chat/             # AI concierge area & input
│           │   ├── layout/           # Header, sidebar, mobile nav
│           │   ├── modals/           # Register, schedule, verify OTP
│           │   └── views/            # Admin, Executive, Reception, Resident
│           └── lib/                  # Types, utils, mock data
│
├── packages/
│   └── shared/                       # Zero-drift contracts
│       └── src/                      # Zod schemas, enums, API DTOs
│
├── 01_PRD.md … 06_system_design_rules.md   # Spec documents
├── turbo.json                        # Turborepo pipeline
└── pnpm-workspace.yaml               # Workspace definitions
```

---

## API Reference (`/api/v1`)

All endpoints require JWT Bearer authorization unless marked Public.

### Authentication (`/auth`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/auth/login` | POST | Public | Email/phone + password → access token + refresh cookie |
| `/auth/refresh` | POST | Public | Rotate refresh token, issue fresh access token |
| `/auth/logout` | POST | Auth | Invalidate refresh cookie |
| `/auth/accept-invite` | POST | Public | Accept invitation, set credentials, activate role |
| `/auth/switch-society` | POST | Auth | Switch tenant context, receive new token pair |
| `/auth/me` | GET | Auth | Profile, memberships, linked units |

### Parcels (`/parcels`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/parcels` | POST | Reception, Admin | Register inbound package (< 30s) |
| `/parcels` | GET | Auth | Filter by status, unit, date with pagination |
| `/parcels/:id` | GET | Auth | Full parcel record with active schedule |
| `/parcels/:id/schedule` | POST | Resident, Admin | Book delivery time window |
| `/parcels/:id/handover-otp` | POST | Resident | Retrieve/regenerate 6-digit OTP |
| `/parcels/:id/move-storage` | POST | Reception, Admin | Transfer to different vault location |
| `/parcels/:id/pickup-request` | POST | Resident | Request self-pickup at reception |
| `/parcels/:id/pickup-complete` | POST | Reception, Admin | Verify identity, mark DELIVERED |
| `/parcels/:id/return-to-courier` | POST | Reception, Admin | Return to courier with reason |

### Shipments — USIE (`/shipments`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/shipments` | GET | Resident | Tracked packages with carrier events, matched parcels, ETA |
| `/shipments/manual` | POST | Resident | Track by carrier + tracking number; conflict-safe auto-linking |
| `/shipments/expected` | GET | Reception, Admin | Incoming shipments expected at gate |
| `/shipments/match-parcel` | POST | Reception, Admin | Bridge reception intake to expected shipment |

### Slots & Scheduling (`/slots`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/slots/templates` | GET / POST | Society Admin | List or create delivery windows and capacity caps |
| `/slots/templates/:id` | PATCH | Society Admin | Update window timing, days, or capacity |
| `/slots/available` | GET | Auth | Open slots for a date with cutoff status |
| `/slots/recommendations` | GET | Auth | Deterministic multi-factor slot scoring |
| `/slots/consolidate-book` | POST | Resident, Admin | Batch multiple parcels into one delivery run |
| `/slots/instances/:id` | PATCH | Society Admin | Block date or override capacity |
| `/slots/:parcelId/reschedule` | POST | Resident, Admin | Atomic slot swap |
| `/slots/:parcelId/cancel` | POST | Resident, Admin | Cancel before cutoff |

### Tasks & Verification (`/tasks`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/tasks` | GET | Executive, Admin | Assigned or unassigned pool tasks |
| `/tasks/:id/claim` | POST | Executive | Claim task from society pool |
| `/tasks/:id/start` | POST | Executive | QR scan → `OUT_FOR_DELIVERY` |
| `/tasks/:id/verify-otp` | POST | Executive | Enter 6-digit OTP → verify → `DELIVERED` |
| `/tasks/:id/fail` | POST | Executive | Report failure, return parcel to vault |
| `/tasks/:id/override` | POST | Admin, Reception | Staff override with reason + recipient |

### Reports & KPIs (`/reports`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/reports/dashboard` | GET | Staff, Admin | Operations summary and storage utilization |
| `/reports/pilot-kpis` | GET | Auth | Consolidation rate, dwell time, handover success |
| `/reports/ageing-parcels` | GET | Staff, Admin | Parcels past storage threshold |
| `/reports/slot-utilization` | GET | Society Admin | Window capacity utilization |
| `/reports/executives` | GET | Society Admin | Courier throughput and success rate |

### Devices & Notifications (`/devices`, `/notification-preferences`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/devices` | POST | Auth | Register FCM / Web Push device token |
| `/devices/:token` | DELETE | Auth | Unregister device token |
| `/notification-preferences` | GET / PATCH | Auth | Per-category alert preferences |

### Society (`/society`)

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/society/units/search` | GET | Staff, Admin | Typeahead lookup by unit, tower, or resident |
| `/society/units/import` | POST | Society Admin | Bulk CSV unit onboarding with validation |
| `/society/invites/:id/resend` | POST | Society Admin | Regenerate invitation token |

---

## Getting Started

### Prerequisites

- **Node.js** v20+ (`.nvmrc` provided)
- **pnpm** v9+
- **PostgreSQL** v14+

### 1. Clone & Install

```bash
git clone https://github.com/DevRexxxx/ParcelTime.git
cd ParcelTime
pnpm install
```

### 2. Environment

Create `apps/api/.env`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/parceltime?schema=public"
JWT_ACCESS_SECRET="your-access-secret-min-32-chars-long!"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars-long!"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="30d"
WEB_ORIGIN="http://localhost:3000"
```

### 3. Database Setup

```bash
pnpm --filter @parceltime/api run db:generate
pnpm --filter @parceltime/api run db:migrate
pnpm --filter @parceltime/api run db:seed
```

### 4. Run

```bash
pnpm dev
```

- **Frontend** → `http://localhost:3000`
- **API** → `http://localhost:3001/api/v1`

---

## Testing

```bash
pnpm test        # 54 tests across 8 suites
pnpm typecheck   # 4 workspace packages
pnpm build       # Production build (shared → api → web)
```

**Test suites:** State machine · OTP · Concurrency · Tenant isolation · Schema validation · USIE tracking & webhooks · Roadmap features · Consolidation & scoring

---

## Design System

ParcelTime offers dual adaptive themes with WCAG AA compliance (4.5:1 contrast), touch-friendly 44px tap targets, and smooth micro-interactions:

### Color System & Themes

| Token / Layer | Midnight Aurora (Dark) | Fresh Residential (Light) | Role |
|---|---|---|---|
| **Background** | `#0B1020` → `#141B34` | `#F6F8FB` → `#EAF2FF` | Viewport gradient background |
| **Surface** | `#171E3A` | `#FFFFFF` | Floating card surfaces |
| **Border** | `#2A3358` | `#E2E8F0` | Structural card borders |
| **Primary Text** | `#E8ECFF` | `#0F172A` | High-contrast headings and body |
| **Muted Text** | `#9AA4CF` | `#64748B` | Secondary details, timestamps, IDs |
| **Primary Gradient** | `#6366F1` → `#22D3EE` | `#2563EB` → `#06B6D4` | High-priority CTAs, active nav tab |
| **Accent** | `#A78BFA` | `#10B981` | Accent highlights & badges |

### Semantic Status Colors

| State | Solid Color | Chip Gradient | Description |
|---|---|---|---|
| **Waiting at gate** | `#F59E0B` | `#FBBF24` → `#F59E0B` | Inbound intake held in vault; awaiting resident booking |
| **Scheduled** | `#3B82F6` | `#60A5FA` → `#3B82F6` | Delivery window confirmed by resident |
| **Out for delivery** | `#8B5CF6` | `#A78BFA` → `#7C3AED` | Executive dispatched with parcel; active ETA countdown |
| **Delivered** | `#22C55E` | `#4ADE80` → `#16A34A` | Terminal state; completed via OTP or verified pickup |
| **Issue / Expired** | `#EF4444` | `#F87171` → `#DC2626` | Failed attempt, expired OTP, or dispute |

---

## Demo Accounts & Seed Data

The database seed (`pnpm db:seed`) is **100% idempotent** with reverse-dependency teardown, provisioning **Greenwood Palms Residences**:

| Role | Email | Password | Context & Seeded Parcels |
|---|---|---|---|
| **Resident** | `priya.sharma@gmail.com` | `ParcelTime@2026` | Unit A-102 (Owner) • Has 5 seeded parcels: `PT-8942` (Amazon, waiting), `PT-5519` (Myntra, waiting — for consolidation), `PT-9104` (Blue Dart, scheduled tomorrow), `PT-7621` (Delhivery, out for delivery with OTP `482910`), `PT-6310` (DTDC, delivered). Connected Gmail integration. |
| **Resident** | `arun.patel@gmail.com` | `ParcelTime@2026` | Unit B-302 (Tenant) • Has `PT-3301` (Ekart Logistics, waiting at gate). |
| **Delivery Executive** | `rajesh.exec@greenwood.in` | `ParcelTime@2026` | Active shift courier • Assigned task for `PT-7621` approaching Tower A. |
| **Reception Staff** | `reception@greenwood.in` | `ParcelTime@2026` | Gate 1 Concierge Desk • Fast barcode check-in and vault storage access. |
| **Society Admin** | `admin@greenwood.in` | `ParcelTime@2026` | Estate Manager • Governance, slot templates, override review, audit log. |
| **Platform Admin** | `platform@parceltime.in` | `ParcelTime@2026` | Multi-society headquarters governance. |

---

## Version History

| Version | Date | Highlights |
|---|---|---|
| **2.3.0** | 2026-11-12 | **Residential UI/UX Redesign & Seed Invariant Overhaul:** (1) Interactive standalone prototype ([`/redesign.html`](https://parceltimeweb-production.up.railway.app/redesign.html)) with dual-theme system (Midnight Aurora dark / Fresh Residential light), plain language navigation (Home, Parcels, Schedule, Assistant), 4-step progress tracker with visible step labels (`Arrived` → `Scheduled` → `Out for delivery` → `Delivered`), tap-to-reveal OTP sheet with 5-minute countdown and auto-hide, dedicated notification drawer, and 4-state switcher (Active, Loading, Empty, Error/Offline); (2) 100% idempotent database seeding (`pnpm db:seed`) with reverse-dependency teardown, strict Prisma enum type-safety, and complete persona alignment with mock data; (3) Monorepo-wide zero-warning linting across all packages and vector SVG app icon metadata (`/icon.svg`). 54 tests / 8 suites. |
| **2.2.0** | 2026-11-11 | USIE live tracking architecture — multi-carrier webhooks (HMAC-SHA256), Gmail dispatch parsing, zero-trust custody invariant, cross-resident conflict detection, bidirectional auto-linking, P2002 race condition handling. 54 tests / 8 suites. |
| **2.1.0** | 2026-11-10 | Smart consolidation, hybrid fulfillment modes, intelligent slot scoring, pilot KPIs & storage ageing, AI concierge natural language dispatch. |
| **2.0.5** | 2026-11-10 | Replaced Argon2id with bcryptjs for zero-native-addon container compatibility (Node 24 / Railway / Alpine). |
| **2.0.4** | 2026-11-09 | Monorepo package resolution: `@parceltime/shared` dual CJS/ESM exports, autonomous build chaining. |
| **2.0.3** | 2026-11-09 | Security audit alignment: removed OTP from AI chat, purged code copy buttons, role-aware navigation. |
| **2.0.2** | 2026-11-09 | QR label badge modal, barcode laser simulation, society typeahead, duplicate tracking sentinel, OTP keypad. |
| **2.0.1** | 2026-11-09 | CI lockfile sync, frozen-lockfile enforcement in GitHub Actions. |
| **2.0.0** | 2026-11-08 | Spatial Design System: Pure Black theme, animated gradient input, 14 Bento cards, AI concierge, document viewer. |
| **1.5.0** | 2026-11-07 | pg-boss background workers: aging job, slot generation, delivery reminders, outbox push dispatcher. |
| **1.4.0** | 2026-11-06 | Zero-trust OTP engine: keyed SHA-256, 15-min expiry, 5-attempt lockout, staff overrides. |
| **1.3.0** | 2026-11-05 | Inbound reception: < 30s barcode intake, vault placement, QR token generation, self-pickup. |
| **1.2.0** | 2026-11-04 | Slot booking engine: row-locking concurrency, atomic reschedule, 2-hour cutoff, auto task generation. |
| **1.1.0** | 2026-11-03 | Multi-tenant platform, 5-tier RBAC, rotating refresh tokens, append-only audit trail. |
| **1.0.0** | 2026-11-01 | Foundation: Turborepo monorepo, 17 Prisma entities, parcel state machine, Greenwood Palms seed. |

---

## Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit — `git commit -m 'feat: your feature description'`
4. Verify — `pnpm typecheck && pnpm test`
5. Push & open a Pull Request

---

<p align="center">
  <strong>Built with ❤️ for modern residential communities</strong><br/>
  <em>Your Parcel. Your Time. Your Convenience.</em>
</p>

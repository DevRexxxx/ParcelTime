# ParcelTime

### Your Parcel. Your Time. Your Convenience.

ParcelTime is a smart residential parcel management and
scheduled-delivery platform designed for gated communities, apartment
complexes, and property-managed residences in India.

It addresses a common last-mile delivery problem: parcels are marked
"arriving today," but residents often have no control over the actual
delivery time. Residents may be at work, away from home, or otherwise
unavailable when a courier arrives.

ParcelTime introduces a society-level parcel reception workflow.
Authorized staff receive and register eligible parcels, residents are
notified, and residents can schedule a convenient delivery window.
Authorized delivery personnel then deliver the parcel and record a
secure handover.

> **Core idea:** Instead of adapting your schedule to your parcel, your
> parcel adapts to your schedule.

------------------------------------------------------------------------

## Table of Contents

-   [Problem Statement](#problem-statement)
-   [Proposed Solution](#proposed-solution)
-   [How It Works](#how-it-works)
-   [User Roles](#user-roles)
-   [Features](#features)
-   [MVP Scope](#mvp-scope)
-   [Technology Stack](#technology-stack)
-   [System Architecture](#system-architecture)
-   [Data Model](#data-model)
-   [Parcel Lifecycle](#parcel-lifecycle)
-   [Security and Privacy](#security-and-privacy)
-   [Business Model](#business-model)
-   [Development Roadmap](#development-roadmap)
-   [Getting Started](#getting-started)
-   [Environment Variables](#environment-variables)
-   [Suggested Project Structure](#suggested-project-structure)
-   [API Overview](#api-overview)
-   [Testing](#testing)
-   [Deployment](#deployment)
-   [Future Enhancements](#future-enhancements)
-   [Risks and Operational
    Considerations](#risks-and-operational-considerations)
-   [Contributing](#contributing)
-   [License](#license)

------------------------------------------------------------------------

## Problem Statement

Conventional parcel delivery creates friction for residents, residential
societies, and courier operators.

### Residents

-   Delivery time estimates are often broad or unpredictable.
-   Residents miss deliveries while at work or away from their
    apartment.
-   They must coordinate with courier executives through calls and
    messages.
-   Parcels may be left unattended or require repeated delivery
    attempts.
-   Managing multiple parcels from different couriers can become
    inconvenient.

### Residential Societies

-   Security staff may receive many parcels while managing other
    responsibilities.
-   Parcel ownership, storage location, and handover status can be
    difficult to track.
-   Temporary parcel storage may be unorganized.
-   Societies need accountability for parcel custody.

### Courier Operations

-   Failed or repeated delivery attempts increase last-mile costs.
-   Delivery executives spend time contacting unavailable recipients.
-   Deliveries within a large community may be inefficiently handled one
    at a time.

## Proposed Solution

ParcelTime provides a centralized parcel reception and
scheduled-delivery workflow for participating residential communities.

1.  An authorized reception staff member receives an eligible parcel.
2.  The parcel is digitally registered and assigned a unique Parcel ID.
3.  The parcel is stored in a designated, secure location.
4.  The resident receives a notification.
5.  The resident chooses an available delivery date and time window.
6.  Authorized delivery personnel fulfill the scheduled delivery.
7.  The recipient verifies the handover using an OTP or another approved
    verification method.
8.  The platform records the parcel's final status and delivery audit
    trail.

ParcelTime is intended to complement existing courier services. Parcel
acceptance must follow applicable courier policies, society rules,
resident authorization, and operational agreements.

------------------------------------------------------------------------

## How It Works

### 1. Parcel Reception

A courier executive arrives at a participating society's authorized
reception point. Reception staff verify the parcel and resident details,
capture relevant information, and register the package.

Information may include: - Courier company - Tracking number - Resident
and apartment - Parcel photograph, where appropriate - Reception
timestamp - Staff member who received it - Storage location

### 2. Resident Notification

The resident receives an in-app or push notification indicating that a
parcel has arrived at the society reception point.

### 3. Delivery Scheduling

The resident selects the parcel and chooses from available time windows,
for example:

  Slot        Example Time
  ----------- -------------------
  Morning     8:00 AM--10:00 AM
  Afternoon   1:00 PM--3:00 PM
  Evening     6:00 PM--8:00 PM
  Night       8:00 PM--10:00 PM

Slots are configurable by the society. Availability depends on staff
capacity, delivery policies, and parcel volume.

### 4. Delivery Assignment

The platform creates a delivery task and assigns it to an authorized
delivery executive. Tasks may be grouped by tower, floor, or apartment
to improve operational efficiency.

### 5. Secure Handover

The delivery executive verifies the parcel and recipient. The resident
provides a one-time passcode (OTP), or an approved alternative
verification method is used. The system records the successful handover.

### 6. Delivery Completion

The parcel status is updated to `DELIVERED`. The resident receives a
confirmation and can view the delivery in their history.

------------------------------------------------------------------------

## User Roles

### Resident

-   View parcels associated with their apartment.
-   Receive parcel notifications.
-   Schedule, reschedule, or cancel eligible delivery requests.
-   View parcel and delivery status.
-   Request authorized self-pickup.
-   View delivery history.

### Society Administrator

-   Manage society profile and settings.
-   Manage apartment units and resident accounts.
-   Manage reception staff and delivery executives.
-   Configure delivery windows and slot capacity.
-   Monitor parcel inventory and delivery performance.
-   Review reports and audit events.

### Parcel Reception Staff

-   Register incoming parcels.
-   Verify apartment and resident details.
-   Capture parcel information and photographs.
-   Assign storage locations.
-   Notify residents.
-   Release parcels for scheduled delivery or approved pickup.

### Delivery Executive

-   View assigned delivery tasks.
-   View approved delivery instructions.
-   Scan parcel QR codes.
-   Update delivery status.
-   Verify recipient handover.
-   Record unsuccessful delivery attempts with a reason.

------------------------------------------------------------------------

## Features

### Resident Application

-   Resident dashboard with parcel counts and upcoming deliveries.
-   Parcel details and tracking information.
-   Delivery scheduling with date and time-slot selection.
-   Slot availability and capacity checks.
-   Rescheduling and cancellation.
-   Real-time or push notifications.
-   Delivery history.
-   Self-pickup request workflow.

### Society Management Dashboard

-   Society and apartment management.
-   User and role administration.
-   Parcel inventory overview.
-   Storage location management.
-   Delivery slot configuration.
-   Staff assignment.
-   Delivery analytics and operational reports.

### Parcel Reception

-   Parcel registration form.
-   Unique Parcel ID.
-   QR code generation and scanning.
-   Courier and tracking information.
-   Reception timestamp and staff attribution.
-   Storage location assignment.
-   Parcel status management.

### Delivery Operations

-   Assigned task list.
-   Delivery slot and apartment details.
-   QR-based parcel identification.
-   OTP-based handover verification.
-   Failed-delivery reason capture.
-   Delivery timestamps and audit records.

### Analytics

Potential dashboard metrics: - Parcels received today - Parcels awaiting
scheduling - Parcels scheduled for delivery - Completed deliveries -
Failed or delayed deliveries - Storage occupancy - On-time delivery
rate - Average parcel handling time

------------------------------------------------------------------------

## MVP Scope

The first release should focus on one participating society and the
essential parcel lifecycle.

**Included in the MVP:** - Secure authentication - Role-based access
control - Society and apartment management - Parcel registration -
Parcel QR code generation - Resident notifications - Delivery slot
scheduling - Slot capacity management - Delivery executive task
dashboard - OTP-based handover verification - Parcel status history -
Basic administrative analytics

**Deferred from the MVP:** - AI-powered scheduling - Advanced route
optimization - Hardware-integrated smart lockers - Multi-courier API
integrations - Automated billing and subscription management -
Multi-society enterprise analytics

The initial product should validate the workflow before adding expensive
or operationally complex features.

------------------------------------------------------------------------

## Technology Stack

The proposed stack is suitable for a modern web-based MVP. Specific
technologies can be adjusted during implementation.

  -----------------------------------------------------------------------
  Layer                               Technology
  ----------------------------------- -----------------------------------
  Frontend                            React, TypeScript, Vite

  UI                                  Tailwind CSS, shadcn/ui

  Routing                             React Router

  Server State                        TanStack Query

  Backend                             Node.js, Express.js, TypeScript

  Database                            PostgreSQL

  ORM                                 Prisma

  Authentication                      JWT access tokens and refresh
                                      tokens

  Real-time Events                    Socket.IO

  Push Notifications                  Firebase Cloud Messaging

  QR Codes                            `qrcode`

  QR Scanning                         `html5-qrcode`

  Image Storage                       AWS S3 or Cloudinary

  API Documentation                   Swagger / OpenAPI

  Testing                             Vitest, Jest, Supertest, Playwright

  Deployment                          Vercel for frontend; Render, AWS,
                                      or equivalent for backend and
                                      database
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## System Architecture

``` text
                 ┌────────────────────────┐
                 │   Resident Web App     │
                 └───────────┬────────────┘
                             │
┌────────────────────────┐   │   ┌────────────────────────┐
│ Society Admin Dashboard │───┼───│ Staff / Delivery App    │
└────────────────────────┘   │   └────────────────────────┘
                             ▼
                 ┌────────────────────────┐
                 │     Express API        │
                 │ Authentication & RBAC  │
                 └───────────┬────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐   ┌────────────────┐   ┌─────────────────┐
│ Parcel Service│   │Schedule Service│   │Notification Svc │
└───────┬───────┘   └───────┬────────┘   └────────┬────────┘
        │                   │                     │
        └───────────────────┼─────────────────────┘
                            ▼
                  ┌──────────────────┐
                  │   PostgreSQL      │
                  └──────────────────┘
                            │
                  ┌──────────────────┐
                  │ Object Storage    │
                  │ Parcel Images     │
                  └──────────────────┘
```

### Architectural Principles

-   Modular services and clear separation of concerns.
-   REST APIs for core workflows.
-   Database-backed state and transaction-safe updates.
-   Role-based and society-scoped access control.
-   Validation at API boundaries.
-   Audit records for custody and handover events.
-   Notification delivery separated from core parcel operations.

------------------------------------------------------------------------

## Data Model

The following entities are suggested for the initial database design.

### User

Stores account and role information.

Suggested fields: - `id` - `fullName` - `email` - `phone` -
`passwordHash` - `role` - `societyId` - `apartmentId` (nullable for
staff) - `createdAt` - `updatedAt`

### Society

Stores residential community information.

Suggested fields: - `id` - `name` - `address` - `totalApartments` -
`managerId` - `settings` - `createdAt`

### Apartment

Represents a unit within a society.

Suggested fields: - `id` - `societyId` - `tower` - `floor` -
`unitNumber` - `residentId`

### Parcel

Stores registered parcel details.

Suggested fields: - `id` - `trackingNumber` - `courierCompany` -
`residentId` - `societyId` - `receivedBy` - `storageLocation` -
`parcelImageUrl` - `status` - `receivedAt` - `createdAt` - `updatedAt`

### DeliverySchedule

Stores a resident's scheduled delivery request.

Suggested fields: - `id` - `parcelId` - `residentId` - `deliveryDate` -
`startTime` - `endTime` - `assignedExecutiveId` - `status` -
`createdAt` - `updatedAt`

### DeliveryRecord

Stores final delivery or failed-attempt details.

Suggested fields: - `id` - `parcelId` - `deliveryExecutiveId` -
`verificationMethod` - `deliveryStatus` - `failureReason` -
`deliveredAt` - `proofOfDelivery` - `createdAt`

### Notification

Stores notification history.

Suggested fields: - `id` - `userId` - `title` - `message` - `type` -
`isRead` - `createdAt`

### AuditLog

Records sensitive parcel events and custody changes.

Suggested fields: - `id` - `parcelId` - `actorUserId` - `eventType` -
`previousStatus` - `newStatus` - `metadata` - `createdAt`

Use database constraints and indexes for unique identifiers,
society-scoped lookups, parcel status queries, and scheduling
operations.

------------------------------------------------------------------------

## Parcel Lifecycle

``` text
RECEIVED
   │
   ▼
IN_STORAGE
   │
   ├──────────────► PICKUP_REQUESTED
   │                       │
   ▼                       ▼
SCHEDULED              PICKED_UP
   │
   ▼
ASSIGNED
   │
   ▼
OUT_FOR_DELIVERY
   │
   ├──────────────► DELIVERY_FAILED
   │                       │
   │                       └──► RESCHEDULED / IN_STORAGE
   ▼
DELIVERED
```

Exact status transitions should be validated by the backend. Clients
should not be able to arbitrarily change parcel states.

------------------------------------------------------------------------

## Security and Privacy

ParcelTime handles residential information and parcel custody. Security
should be treated as a core requirement.

-   Hash passwords using a modern password hashing algorithm such as
    Argon2id or bcrypt.
-   Enforce role-based access control on every protected endpoint.
-   Scope parcel queries by society and resident authorization.
-   Never expose one resident's parcel information to another resident.
-   Store OTPs securely, with expiry and attempt limits.
-   Rate-limit authentication, OTP, and sensitive endpoints.
-   Use HTTPS in production.
-   Validate and sanitize user input.
-   Use short-lived access tokens and securely managed refresh tokens.
-   Restrict access to parcel images and use signed URLs where
    appropriate.
-   Maintain an audit trail for parcel receipt, storage, release, and
    delivery.
-   Avoid storing unnecessary personal data.
-   Define retention and deletion policies for images, logs, and
    delivery records.
-   Use explicit resident authorization and society-approved operating
    procedures for parcel reception and handover.

------------------------------------------------------------------------

## Business Model

ParcelTime can operate as a **B2B2C platform**, partnering with
residential societies and property managers.

Potential revenue streams:

  -----------------------------------------------------------------------
  Revenue Stream                      Description
  ----------------------------------- -----------------------------------
  Society Subscription                Monthly or annual fee paid by a
                                      residential society

  Per-Parcel Service Fee              Charge for each parcel handled

  Premium Resident Plan               Optional paid scheduling or
                                      convenience features

  Priority Delivery                   Additional charge for eligible
                                      priority slots

  Smart Locker Leasing                Leasing or servicing smart locker
                                      infrastructure

  Property Management Contracts       Enterprise agreements with property
                                      operators
  -----------------------------------------------------------------------

Pricing should be validated through a pilot. Revenue estimates must
account for staffing, storage, insurance, support, technology, and
delivery operations.

------------------------------------------------------------------------

## Development Roadmap

### Phase 1 --- Foundation

-   Create frontend and backend applications.
-   Configure PostgreSQL and Prisma.
-   Implement authentication.
-   Define roles and authorization middleware.
-   Create initial database schema.

### Phase 2 --- Society Management

-   Society profile and settings.
-   Apartment registration.
-   Resident and staff management.
-   Role-specific dashboards.

### Phase 3 --- Parcel Reception

-   Parcel registration.
-   QR code generation.
-   Storage assignment.
-   Parcel status tracking.
-   Resident notifications.

### Phase 4 --- Scheduling

-   Delivery slot configuration.
-   Slot availability and capacity checks.
-   Scheduling, rescheduling, and cancellation.
-   Delivery task assignment.

### Phase 5 --- Delivery and Verification

-   Delivery executive dashboard.
-   QR scanning.
-   OTP handover verification.
-   Delivery completion and failed-attempt workflows.
-   Audit logs.

### Phase 6 --- Quality and Launch

-   Unit and integration tests.
-   End-to-end workflow tests.
-   Security review.
-   Responsive UI testing.
-   Deployment and pilot monitoring.

------------------------------------------------------------------------

## Getting Started

> The commands below are a suggested setup for the planned
> implementation. Update them to match the repository's actual scripts
> and package manager.

### Prerequisites

-   Node.js (LTS)
-   npm
-   PostgreSQL
-   Git

### Clone the Repository

``` bash
git clone <repository-url>
cd ParcelTime
```

### Install Dependencies

If the project uses separate frontend and backend directories:

``` bash
cd backend
npm install

cd ../frontend
npm install
```

### Configure Environment Variables

Create `.env` files for the backend and frontend as required. Refer to
the [Environment Variables](#environment-variables) section.

### Run Database Migrations

From the backend directory:

``` bash
npx prisma generate
npx prisma migrate dev
```

### Start the Development Servers

Backend:

``` bash
npm run dev
```

Frontend:

``` bash
npm run dev
```

The development URLs depend on the project configuration. Common
defaults are `http://localhost:5000` for the API and
`http://localhost:5173` for the Vite frontend.

------------------------------------------------------------------------

## Environment Variables

Example backend environment configuration:

``` env
# Application
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/parceltime

# Authentication
JWT_ACCESS_SECRET=replace_with_a_strong_secret
JWT_REFRESH_SECRET=replace_with_a_different_strong_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Storage (configure according to provider)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Notifications (optional for local development)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Example frontend environment configuration:

``` env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Important:** Never commit real credentials, private keys, tokens, or
production `.env` files. Provide a sanitized `.env.example` instead.

------------------------------------------------------------------------

## Suggested Project Structure

``` text
ParcelTime/
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── features/
│       │   ├── auth/
│       │   ├── parcels/
│       │   ├── scheduling/
│       │   ├── deliveries/
│       │   └── notifications/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── hooks/
│       ├── types/
│       └── utils/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── modules/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── societies/
│       │   ├── apartments/
│       │   ├── parcels/
│       │   ├── scheduling/
│       │   ├── deliveries/
│       │   └── notifications/
│       ├── services/
│       ├── utils/
│       ├── app.ts
│       └── server.ts
│
├── docs/
│   ├── architecture.md
│   └── api.md
├── .gitignore
└── README.md
```

------------------------------------------------------------------------

## API Overview

Example REST API groups for the MVP:

  Method   Endpoint                         Description
  -------- -------------------------------- ----------------------------------
  POST     `/api/auth/register`             Register an account
  POST     `/api/auth/login`                Authenticate a user
  POST     `/api/auth/refresh`              Refresh an access token
  GET      `/api/users/me`                  Get current user profile
  GET      `/api/societies/:id`             Get society details
  GET      `/api/apartments`                List authorized apartments
  POST     `/api/parcels`                   Register a parcel
  GET      `/api/parcels`                   List parcels visible to the user
  GET      `/api/parcels/:id`               Get parcel details
  POST     `/api/parcels/:id/schedule`      Schedule a parcel delivery
  PATCH    `/api/schedules/:id`             Reschedule a delivery
  DELETE   `/api/schedules/:id`             Cancel a delivery schedule
  GET      `/api/deliveries/assigned`       List assigned delivery tasks
  POST     `/api/deliveries/:id/verify`     Verify parcel handover
  POST     `/api/deliveries/:id/complete`   Mark delivery completed
  GET      `/api/notifications`             Get user notifications

These routes are illustrative. Final endpoint names and payloads should
be documented through Swagger/OpenAPI.

------------------------------------------------------------------------

## Testing

The platform should test both individual components and complete user
workflows.

### Unit Tests

-   Parcel status transition rules.
-   Delivery slot availability logic.
-   OTP expiry and validation.
-   Role-based permission checks.

### Integration Tests

-   Parcel registration and database persistence.
-   Scheduling and capacity validation.
-   Notification creation.
-   Delivery completion and audit log creation.

### End-to-End Tests

1.  Reception staff registers a parcel.
2.  Resident receives a notification.
3.  Resident schedules a delivery.
4.  Delivery executive receives the task.
5.  Resident verifies the handover.
6.  Parcel is marked delivered.
7.  Resident can view the delivery history.

Also test unauthorized access, cross-resident parcel access, slot
overbooking, invalid OTPs, and failed delivery scenarios.

------------------------------------------------------------------------

## Deployment

A potential deployment setup:

-   **Frontend:** Vercel or equivalent static hosting.
-   **Backend:** Render, AWS, or another Node.js hosting provider.
-   **Database:** Managed PostgreSQL.
-   **Parcel Images:** Private object storage with access-controlled
    URLs.
-   **Notifications:** Firebase Cloud Messaging.
-   **Monitoring:** Application logs, error tracking, uptime monitoring,
    and database metrics.

Production deployment should include: - HTTPS - Secure secrets
management - Database backups - Migration management - Rate limiting -
Health checks - Error monitoring - Access-controlled storage - A
documented incident response process

------------------------------------------------------------------------

## Future Enhancements

After validating the MVP, potential enhancements include:

-   Smart locker integration with secure compartment access.
-   Automated delivery batching by tower and floor.
-   Route optimization for society delivery personnel.
-   Recurring resident delivery preferences.
-   Priority and express delivery options.
-   Return pickup scheduling.
-   Grocery, pharmacy, laundry, and document handling.
-   Courier partner integrations.
-   Society subscription billing.
-   Multi-society property management.
-   Operational forecasting and analytics.

------------------------------------------------------------------------

## Risks and Operational Considerations

The product's success depends on operational execution as much as
software.

-   **Courier acceptance:** Parcel reception must comply with courier
    policies and appropriate authorization.
-   **Parcel custody:** Clearly define responsibility for lost, damaged,
    or incorrectly handed-over parcels.
-   **Storage capacity:** Societies need a designated and secure
    temporary storage area.
-   **Staffing:** Delivery slots must reflect actual staff availability.
-   **Scheduling reliability:** Prevent slot overbooking and communicate
    delays.
-   **Privacy:** Limit access to resident information and parcel
    details.
-   **Pilot validation:** Measure resident adoption, delivery
    reliability, handling cost, and operational workload before scaling.

------------------------------------------------------------------------

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

1.  Fork the repository.
2.  Create a feature branch.
3.  Make focused changes.
4.  Add or update tests.
5.  Submit a pull request with a clear description.

Please avoid committing credentials, resident information, real tracking
numbers, or other sensitive data.

------------------------------------------------------------------------

## License

Choose and add a license before making the repository publicly
available. If no license is specified, the project's reuse permissions
may be restricted.

------------------------------------------------------------------------

## Project Vision

ParcelTime aims to make residential parcel delivery predictable, secure,
and resident-controlled.

By turning apartment societies into organized parcel reception and
delivery hubs, the platform can reduce missed deliveries, improve
accountability, and make last-mile logistics more convenient.

**ParcelTime --- Your Parcel. Your Time. Your Convenience.**

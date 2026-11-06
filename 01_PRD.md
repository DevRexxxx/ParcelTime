# ParcelTime — Product Requirements Document (PRD)

| | |
|---|---|
| **Product** | ParcelTime |
| **Version** | 1.0 (MVP) |
| **Status** | Draft for build |
| **Market** | Gated communities and apartment societies in India |
| **Related docs** | 02_TRD, 03_Architecture, 04_MVP_Screens, 05_User_Flows, 06_System_Design_Rules |

---

## 1. Overview

ParcelTime is a parcel reception and scheduled-delivery platform for residential societies. Society reception staff receive and register parcels on behalf of residents. Residents are notified and choose a delivery window. An authorized delivery executive delivers the parcel and the handover is verified with a one-time passcode (OTP). Every custody change is recorded in an audit trail.

**Core idea:** Instead of adapting your schedule to your parcel, your parcel adapts to your schedule.

ParcelTime complements courier services. It does not replace them. Acceptance of parcels at the society reception depends on courier policy, society rules and resident authorization.

## 2. Problem Statement

| Stakeholder | Pain today |
|---|---|
| Residents | Missed deliveries, broad delivery windows, repeated calls with couriers, parcels left unattended, many parcels from many couriers to track. |
| Societies | Security staff overloaded, no record of who holds which parcel, disorganized temporary storage, no accountability for custody. |
| Couriers | Failed and repeated attempts, time lost calling unavailable recipients, one-by-one delivery inside large communities. |

## 3. Goals and Non-Goals

### 3.1 Goals (MVP)
1. Give residents control over when a parcel is delivered to their door.
2. Give societies a reliable, auditable record of parcel custody from receipt to handover.
3. Keep parcel registration fast enough that guards will actually use it.
4. Validate the operational model in one pilot society before investing in expansion.

### 3.2 Non-Goals (MVP)
- AI-driven scheduling and advanced route optimization.
- Hardware smart lockers.
- Courier API integrations.
- Billing, subscriptions and payments.
- Multi-society enterprise analytics.
- Native mobile apps (the MVP ships as installable web apps).
- Handling of cash-on-delivery parcels, perishables, high-value or regulated items (policy decision for pilot; see Section 12).

## 4. Target Users and Personas

| Persona | Description | Primary need | Device |
|---|---|---|---|
| **Resident (Asha)** | Working professional, often away 9 to 7. Receives several parcels a week. | Pick a delivery time that fits her day; know where her parcel is. | Android phone, some iPhone |
| **Reception staff (Ramesh)** | Security or front-desk employee, handles many tasks at once, limited tech comfort. | Register a parcel in seconds, find a parcel instantly. | Shared Android phone or tablet at the desk, patchy network |
| **Delivery executive (Imran)** | Society employee who carries parcels to apartments. | Clear task list grouped by tower, quick handover verification. | Android phone |
| **Society administrator (Meera)** | Committee member or property manager. | Configure slots, manage people, see performance and resolve disputes. | Laptop and phone |
| **Platform admin (internal)** | ParcelTime operator. | Onboard societies, support and troubleshoot. | Laptop |

## 5. Scope

### 5.1 In scope for the MVP
- Invite-based onboarding with secure authentication and role-based access control.
- Society, tower and unit management, including bulk import of units.
- Resident membership of units with admin approval.
- Parcel registration with courier, tracking number, unit, photo and storage location.
- Unique Parcel ID and QR label.
- Resident notifications (in-app and push).
- Delivery slot configuration, capacity and resident scheduling, rescheduling and cancellation.
- Delivery task assignment and an executive task dashboard.
- OTP-based handover verification, with a controlled staff override.
- Failed delivery recording with reason.
- Self-pickup workflow.
- Unclaimed parcel handling.
- Parcel status history and audit timeline.
- Basic admin analytics.

### 5.2 Deferred
AI scheduling, route optimization, smart lockers, courier integrations, billing, multi-society analytics, SMS and WhatsApp notifications (post-pilot), native apps.

## 6. User Stories

IDs are used for traceability to screens and flows.

### Resident
- **US-R1** As a resident, I can join my society using an invite and be linked to my unit, so that I see only my unit's parcels.
- **US-R2** As a resident, I am notified when a parcel arrives, so that I can plan.
- **US-R3** As a resident, I can pick an available date and time window, so that the parcel arrives when I am home.
- **US-R4** As a resident, I can reschedule or cancel before the cutoff, so that I stay flexible.
- **US-R5** As a resident, I can see my OTP at handover, so that only I (or someone I trust) can accept the parcel.
- **US-R6** As a resident, I can request self-pickup from reception, so that I can collect it myself.
- **US-R7** As a resident, I can view parcel history and status timeline, so that I know what happened.
- **US-R8** As a resident, I can control my notification preferences.

### Reception staff
- **US-S1** As reception staff, I can register a parcel quickly by scanning the courier label and selecting the unit, so that arrival is recorded in seconds.
- **US-S2** As reception staff, I can attach a photo and assign a storage location, so that the parcel can be found later.
- **US-S3** As reception staff, I can look up any parcel by Parcel ID, QR, tracking number or unit, so that I can answer queries fast.
- **US-S4** As reception staff, I can confirm a self-pickup after verification, so that custody transfers properly.
- **US-S5** As reception staff, I can mark a parcel as returned to courier with a reason.

### Delivery executive
- **US-D1** As a delivery executive, I see my tasks for the day grouped by tower and slot.
- **US-D2** As a delivery executive, I scan the parcel QR when taking it out of storage, so that custody is recorded.
- **US-D3** As a delivery executive, I verify the handover with the resident's OTP.
- **US-D4** As a delivery executive, I record a failed attempt with a reason.

### Society administrator
- **US-A1** As an admin, I can import units and invite residents and staff.
- **US-A2** As an admin, I can approve or reject join requests.
- **US-A3** As an admin, I can configure delivery slots, capacity, cutoffs and storage locations.
- **US-A4** As an admin, I can assign deliveries or let executives claim them.
- **US-A5** As an admin, I can see parcel inventory, ageing parcels and delivery performance.
- **US-A6** As an admin, I can review any parcel's full audit timeline and approve exceptions.

## 7. Functional Requirements

Priority: **M** = must have for MVP, **S** = should have, **C** = could have.

### 7.1 Identity, access and onboarding
| ID | Requirement | Pri |
|---|---|---|
| FR-AUTH-1 | Users sign in with credentials; sessions use short-lived access tokens and rotating refresh tokens. | M |
| FR-AUTH-2 | Accounts are created only through admin-issued invites or approved join requests. There is no open public registration. | M |
| FR-AUTH-3 | Roles: Resident, Reception, Delivery Executive, Society Admin, Platform Admin. A person may hold more than one role in a society. | M |
| FR-AUTH-4 | Password reset by verified email or phone. | M |
| FR-AUTH-5 | A user who belongs to more than one society can switch the active society. | S |
| FR-AUTH-6 | Admin can deactivate a user; deactivated users lose access immediately. | M |

### 7.2 Society and unit management
| ID | Requirement | Pri |
|---|---|---|
| FR-SOC-1 | Admin maintains society profile, towers and units (tower, floor, unit number). | M |
| FR-SOC-2 | Bulk import of units from CSV with validation report. | M |
| FR-SOC-3 | A unit can have multiple residents with a type (owner, tenant, family member). | M |
| FR-SOC-4 | Admin invites residents by phone or email, or approves a resident's join request. | M |
| FR-SOC-5 | Admin manages storage locations (name, capacity, active flag). | M |
| FR-SOC-6 | Society-level settings: timezone, slot templates, booking cutoff, scheduling horizon, unclaimed-parcel threshold, photo-required toggle, assignment mode (manual or pool). | M |

### 7.3 Parcel reception
| ID | Requirement | Pri |
|---|---|---|
| FR-PAR-1 | Register a parcel with courier, tracking number, unit, optional recipient name, photo and storage location. | M |
| FR-PAR-2 | The system generates a unique Parcel ID and a printable or displayable QR label. The QR carries no personal data. | M |
| FR-PAR-3 | Reject or warn on duplicate tracking number within the same society and courier. | M |
| FR-PAR-4 | Scan courier label barcode to fill tracking number. | S |
| FR-PAR-5 | Registration must work on a mobile browser and tolerate brief network loss (queue and retry). | S |
| FR-PAR-6 | Reception can move a parcel between storage locations; each move is audited. | M |
| FR-PAR-7 | Reception can mark a parcel as returned to courier with a reason. | M |
| FR-PAR-8 | Search by Parcel ID, QR, tracking number, unit and status. | M |

### 7.4 Notifications
| ID | Requirement | Pri |
|---|---|---|
| FR-NOT-1 | Create an in-app notification for each key event (see list below). | M |
| FR-NOT-2 | Send push notifications to registered devices of the relevant users. | M |
| FR-NOT-3 | Notification failure must never block or roll back a parcel operation. | M |
| FR-NOT-4 | Users can set preferences per notification category (except critical ones). | S |
| FR-NOT-5 | Reminder before a scheduled delivery window. | S |

Key events: parcel received, schedule confirmed, schedule changed or cancelled, reminder, task assigned, out for delivery, delivered, delivery failed, pickup ready, unclaimed warning, join approved.

### 7.4a Scheduling
| ID | Requirement | Pri |
|---|---|---|
| FR-SCH-1 | Admin defines slot templates (window start and end, capacity, active days). | M |
| FR-SCH-2 | Residents see only slots with remaining capacity, inside the scheduling horizon and before the cutoff. | M |
| FR-SCH-3 | Booking must never exceed capacity, even under simultaneous requests. | M |
| FR-SCH-4 | Residents can reschedule or cancel until the cutoff. After cutoff, only admin can change. | M |
| FR-SCH-5 | A parcel has at most one active schedule at a time. | M |
| FR-SCH-6 | Admin can block a date or reduce capacity for a slot (holidays, staff shortage); affected residents are notified and asked to reschedule. | S |

### 7.5 Delivery operations
| ID | Requirement | Pri |
|---|---|---|
| FR-DEL-1 | A delivery task is created automatically when a parcel is scheduled. | M |
| FR-DEL-2 | Assignment modes: admin or reception assigns, or executives claim from a pool. | M |
| FR-DEL-3 | Executives see tasks grouped by slot and tower. | M |
| FR-DEL-4 | Executive scans the parcel QR to start a delivery; this moves the parcel to out-for-delivery and records custody. | M |
| FR-DEL-5 | Handover is verified with a resident OTP. | M |
| FR-DEL-6 | OTP is time-limited, attempt-limited and stored only in hashed form. | M |
| FR-DEL-7 | If the resident cannot provide an OTP, an authorized staff override is possible only with a reason and photo proof, and is flagged for admin review. | M |
| FR-DEL-8 | Failed attempts require a reason; the parcel returns to storage and the resident is notified to reschedule. | M |
| FR-DEL-9 | After N failed attempts (configurable), the parcel is flagged for admin attention. | S |

### 7.6 Self-pickup and unclaimed parcels
| ID | Requirement | Pri |
|---|---|---|
| FR-PCK-1 | Resident can request self-pickup; reception verifies identity or OTP and completes the pickup. | M |
| FR-PCK-2 | Parcels not scheduled or picked up within the society threshold become unclaimed; the resident receives warnings and admin sees an ageing list. | M |
| FR-PCK-3 | Admin can return an unclaimed parcel to the courier. | M |

### 7.7 Audit and reporting
| ID | Requirement | Pri |
|---|---|---|
| FR-AUD-1 | Every parcel state change and sensitive action is recorded with actor, time, previous and new state and context. | M |
| FR-AUD-2 | Audit records cannot be edited or deleted through the application. | M |
| FR-AUD-3 | Admin dashboard: parcels received today, awaiting scheduling, scheduled, delivered, failed or delayed, storage occupancy, on-time rate, average handling time. | M |
| FR-AUD-4 | Export of parcel and delivery reports to CSV. | S |

## 8. Parcel Lifecycle (product view)

States: Received, In Storage, Scheduled, Assigned, Out for Delivery, Delivered, Delivery Failed, Pickup Requested, Picked Up, Unclaimed, Returned to Courier.

- Residents schedule only parcels that are In Storage.
- Terminal states: Delivered, Picked Up, Returned to Courier.
- Clients can request actions; only the backend decides whether a transition is allowed.

The exact transition table is in the TRD and in the System Design Rules.

## 9. Non-Functional Requirements (summary)

Targets are proposals to be validated during the pilot.

| Area | Target |
|---|---|
| Registration speed | Median task time under 30 seconds for a parcel with barcode scan and photo. |
| Responsiveness | 95th percentile API response under 500 ms for core operations on pilot load. |
| Availability | 99.5% monthly during pilot, with a tested restore procedure. |
| Scale (pilot) | One society, up to 1,000 units, 300 parcels per day peak. Design must not block later multi-society scale. |
| Devices | Mid-range Android on 4G with intermittent connectivity; latest two versions of Chrome and Safari. |
| Accessibility | Large touch targets, high contrast, readable at small sizes, basic screen reader labels. |
| Privacy | A resident can never see another resident's parcel; compliance with India's DPDP Act, to be confirmed with legal counsel. |
| Data retention | Parcel photos and logs follow a retention schedule set by the society policy (default proposed in the TRD). |
| Time | All times stored in UTC and displayed in the society's timezone (IST for the pilot). |
| Languages | English for MVP; UI text must be externalized to allow Hindi later. |

## 10. Success Metrics (pilot, 4 to 6 weeks)

| Metric | Why it matters | Initial target (to calibrate) |
|---|---|---|
| Resident activation | Residents with accounts who have scheduled at least once | 60% of residents who received a parcel |
| Scheduling rate | Parcels scheduled by residents vs. self-pickup vs. unclaimed | 70% scheduled or picked up within 48 hours |
| First-attempt delivery success | Handover completed on first attempt | 90% or higher |
| On-time rate | Delivered within the chosen window | 90% or higher |
| Reception time | Median time to register a parcel | Under 30 seconds |
| Staff workload | Staff hours per parcel | Tracked against baseline from before pilot |
| Unclaimed rate | Parcels exceeding threshold | Under 5% |
| Satisfaction | Resident and staff satisfaction survey | 4 out of 5 or higher |

## 11. Assumptions and Dependencies

**Assumptions**
- The society provides a secure storage area and assigns staff for reception and delivery.
- Couriers agree, at least informally, to drop parcels at the society reception.
- Residents consent to the society receiving parcels on their behalf.
- Residents have smartphones with a modern browser.

**Dependencies**
- Push notification service (Firebase Cloud Messaging).
- Managed PostgreSQL and private object storage hosted in an India region.
- Society-provided unit and resident data for onboarding.
- Written custody and liability policy agreed with society management.

## 12. Operational Policy Decisions Required Before Pilot

| Decision | Owner |
|---|---|
| Which parcel types are accepted or excluded (cash-on-delivery, perishables, high-value) | Society and ParcelTime |
| Liability for loss, damage or wrong handover | Society management and ParcelTime |
| Resident consent wording for parcel reception | Legal / society |
| Staffing per slot and storage capacity | Society management |
| Unclaimed-parcel threshold and return-to-courier procedure | Society management |
| Authorized-receiver rules (family, guard) and override policy | Society management |

## 13. Risks

| Risk | Mitigation |
|---|---|
| Couriers refuse to hand over at reception | Start with couriers already delivering to the gate; obtain management sign-off. |
| Guards find registration slow | Barcode-first form, unit typeahead, offline tolerance, test with real guards. |
| Residents miss notifications | In-app inbox plus push; add SMS or WhatsApp fallback after the pilot. |
| Slot overbooking or understaffing | Capacity enforced in the database; admin can reduce capacity. |
| Privacy incident | Strict scoping, access-controlled images, audit logs, cross-tenant tests. |
| Scope creep | Deferred list frozen until the pilot gate. |

## 14. Release Plan

| Milestone | Outcome |
|---|---|
| M0 Discovery | Observed real workflow; state machine and data model approved. |
| M1 Foundation | Auth, roles, society scoping. |
| M2 Society setup | Units, members, storage, slots. |
| M3 Reception | Parcel registration, QR, notifications. |
| M4 Scheduling | Slots, booking, tasks. |
| M5 Delivery | Executive app, OTP, failures, pickup, unclaimed. |
| M6 Hardening | Analytics, security review, testing. |
| Pilot | 4 to 6 weeks in one society, then a go/no-go gate for expansion. |

## 15. Open Questions
1. Will the pilot society provide a unit and resident list in a usable format?
2. Should reception staff and delivery executives share devices or use personal phones?
3. Is a printed QR label required, or is on-screen QR sufficient for the pilot?
4. What is the default unclaimed threshold and booking cutoff?
5. Is SMS needed from day one for residents without smartphones?

## 16. Glossary

| Term | Meaning |
|---|---|
| Society | A residential community or property-managed complex (the tenant of the platform). |
| Unit | An apartment or flat within a society. |
| Parcel ID | Platform-generated unique identifier for a registered parcel. |
| Slot template | A recurring delivery window with a capacity, configured by the society. |
| Slot instance | A slot template applied to a specific date. |
| Handover | The moment a parcel is given to the resident or authorized receiver. |
| Unclaimed | A parcel in storage beyond the society's threshold without a schedule or pickup. |

# ParcelTime: System Design Rules

Version 1.0 (MVP). Companion to 01_PRD, 02_TRD, 03_Architecture, 04_MVP_Screens, 05_User_Flows.

This document holds the rules the system must always follow. Engineers should treat these as constraints, not suggestions. When a rule conflicts with a feature request, the rule wins until it is changed here deliberately. No code is included.

---

## 1. Parcel State Machine

### 1.1 Statuses

| Status | Meaning |
|---|---|
| RECEIVED | Parcel registered at reception and held in storage |
| SCHEDULED | Resident booked a delivery slot |
| ASSIGNED | An executive is assigned to the delivery task |
| OUT_FOR_DELIVERY | Executive has collected the parcel from storage |
| DELIVERED | Handed to an authorized person and verified |
| CANCELLED | Registration voided (for example, entered in error) |
| UNCLAIMED | Stored longer than the society's limit without action |
| RETURNED_TO_COURIER | Handed back to the courier |

### 1.2 Allowed transitions

| From | To | Who or what can trigger it |
|---|---|---|
| (new) | RECEIVED | Guard, Admin |
| RECEIVED | SCHEDULED | Resident, Admin on behalf of resident |
| RECEIVED | DELIVERED | Guard (self-pickup flow) |
| RECEIVED | CANCELLED | Guard or Admin, with reason |
| RECEIVED | UNCLAIMED | System (aging job) |
| SCHEDULED | RECEIVED | Resident (cancel delivery), System (slot cancelled by admin) |
| SCHEDULED | SCHEDULED | Resident (reschedule) |
| SCHEDULED | ASSIGNED | Admin (assign) or Executive (claim) |
| SCHEDULED | UNCLAIMED | System (aging job, if never delivered) |
| ASSIGNED | SCHEDULED | Admin (unassign) |
| ASSIGNED | RECEIVED | Resident (cancel before cutoff) |
| ASSIGNED | OUT_FOR_DELIVERY | Executive (scans parcel QR) |
| OUT_FOR_DELIVERY | DELIVERED | Executive (valid OTP entered) |
| OUT_FOR_DELIVERY | RECEIVED | Executive (failed attempt, parcel returned to storage) |
| UNCLAIMED | RECEIVED | Admin (resident came forward, storage extended) |
| UNCLAIMED | DELIVERED | Guard (late self-pickup) |
| UNCLAIMED | RETURNED_TO_COURIER | Guard or Admin |
| RECEIVED | RETURNED_TO_COURIER | Admin (resident refused or policy) |

Any transition not in this table is illegal and must be rejected.

### 1.3 Terminal statuses

DELIVERED, CANCELLED and RETURNED_TO_COURIER are terminal. A terminal parcel never changes status again. Corrections are made by an admin creating a correction note, never by reopening the parcel.

### 1.4 Rules

1. **Single source of truth.** Parcel status lives only on the parcel. Schedule, task and attempt records hold details and never carry a competing status.
2. **One entry point.** Every status change goes through one backend function that checks the transition table, the actor's role and ownership, then writes the change and the audit entry in one transaction.
3. **Idempotent.** Repeating the same valid request (for example, a double tap) returns the current result and does not create duplicate records or audit rows.
4. **Reason required** for CANCELLED, failed attempts, returns, and any admin override.
5. **Optimistic concurrency.** Each parcel carries a version number. A change based on a stale version is rejected and the client refreshes.

---

## 2. Slot and Booking Rules

### 2.1 Definitions
- A **slot template** is a society-configured window (for example, 6:00 to 8:00 PM) with a capacity.
- A **slot instance** is a template on a specific date.
- **Capacity** is the maximum number of delivery tasks (not parcels) in an instance. Parcels for the same unit in the same slot count as one stop, subject to a configurable cap on parcels per stop.

### 2.2 Rules
1. Capacity is enforced at the database level inside the booking transaction. UI indicators are advisory only.
2. When many people book the last slot at the same moment, exactly one succeeds and the others receive a clear "slot just filled" response.
3. A booking reserves capacity immediately. There is no separate "hold" in the MVP.
4. **Cutoff:** a slot closes for booking, rescheduling and cancelling a set number of hours before it starts. The cutoff is a society setting.
5. **Booking window:** residents can book only within a configurable number of days ahead.
6. Slot logic uses the society's timezone (IST). Stored timestamps are UTC.
7. Admin can reduce capacity of a future slot. If existing bookings exceed the new capacity, the system warns the admin and lists the surplus bookings. It never silently drops bookings. Admin must resolve them by notifying and rescheduling affected residents.
8. Admin can close a slot (for example, a holiday or lockdown). Affected parcels return to RECEIVED and residents are notified to rebook.
9. Past slots can never be booked or rescheduled into.
10. Reschedule is atomic: the old slot is released and the new one reserved in one transaction, or neither changes.
11. A parcel can have at most one active booking at a time.
12. Limits per unit per day and reschedules per parcel are society settings with sensible defaults.

---

## 3. OTP Rules

### 3.1 Generation and display
1. The OTP is generated for a specific parcel (or a specific delivery stop) when the executive is OUT_FOR_DELIVERY, or on demand by the resident.
2. It is six digits and generated using a secure random source.
3. It is shown only in the resident side of the app to authorized members of the unit.
4. It is never sent to, displayed to, or retrievable by guards, executives or admins.

### 3.2 Storage and validation
1. Only a hash of the OTP is stored, never the plain value.
2. Each OTP is bound to one parcel (or stop) and one challenge record.
3. Validity is short (default ten minutes) and configurable.
4. Maximum failed attempts per OTP is five. After that the challenge locks.
5. A resident may generate a new OTP, which invalidates the previous one. Regeneration is rate limited.
6. A successful verification consumes the OTP. It cannot be reused.
7. Verification attempts, successful or not, are recorded with time and executive identity.

### 3.3 Fallbacks
1. If the resident cannot display the OTP, the executive records a failed attempt (reason: OTP not available) or uses the delegate flow if the society allows it.
2. If society policy allows manual override, an admin-approved override requires a reason and is flagged for review in the audit log.
3. SMS OTP is out of scope for the MVP and is added later behind the same rules.

---

## 4. Multi-Tenancy and Access Control

### 4.1 Tenant isolation
1. Every tenant-owned record carries a society identifier.
2. All data access goes through a layer that automatically applies the society filter derived from the authenticated session, never from client input.
3. The database adds a second layer (row-level security) so a missed filter in application code cannot leak data.
4. Platform-level roles are the only ones allowed to cross societies, and every cross-society access is audited.

### 4.2 Role permissions

| Capability | Resident | Guard | Executive | Admin | Platform Admin |
|---|---|---|---|---|---|
| View own unit's parcels | Yes | No | No | Yes | Yes |
| View all parcels in society | No | Yes | Own tasks and pool | Yes | Yes |
| Register parcel | No | Yes | No | Yes | No |
| Book, reschedule, cancel delivery | Own unit | No | No | On behalf | No |
| Assign or claim tasks | No | No | Claim only (pool mode) | Yes | No |
| Pick up from storage | No | Yes | Yes | Yes | No |
| Verify OTP | No | Yes (self-pickup if policy requires) | Yes | No | No |
| Manage units, staff, slots | No | No | No | Yes | Yes |
| View audit log | No | No | No | Yes | Yes |
| Create societies | No | No | No | No | Yes |

### 4.3 Object-level checks
1. Every request for a specific parcel verifies that the caller is permitted for that parcel's society and, for residents, its unit.
2. Responses for unauthorized objects look identical to "not found" so identifiers cannot be probed.
3. Identifiers are non-sequential and unguessable.

---

## 5. Authentication and Session Rules

1. No open self-registration. Residents join with an invite code and admin approval. Staff are added by admins.
2. Passwords are stored with a strong adaptive hash. Minimum length and common-password checks apply.
3. Access tokens are short-lived. Refresh tokens are stored in secure, httpOnly, same-site cookies and are rotated on use. Reuse of an old refresh token revokes the whole session family.
4. Login and OTP endpoints are rate limited per account and per network address, with lockout and a notification to the user after repeated failures.
5. Sessions can be revoked by the user and by admins (for example, when a staff member leaves).
6. Staff devices that are shared (guard cabin tablet) use per-person logins, with quick switching, so audit entries name a real person.

---

## 6. Audit Rules

1. Every state change, assignment, OTP verification, override, role change, import and configuration change creates an audit entry.
2. An entry records actor, role, society, object, action, previous and new values, reason when required, and time.
3. The audit entry is written in the same transaction as the change it describes. If one fails, both fail.
4. The audit log is append-only. The application's database role has no permission to update or delete entries.
5. Audit entries contain no secrets (no OTPs, passwords or tokens) and minimal personal data.
6. Retention follows the data retention policy in section 10, after which entries are archived or anonymized, never edited.

---

## 7. Notification Rules

### 7.1 Events that notify
| Event | Recipient |
|---|---|
| Parcel received | Unit members |
| Booking confirmed, changed, cancelled | Unit members |
| Slot closed by admin | Affected unit members |
| Out for delivery | Unit members |
| Delivered | Unit members |
| Failed attempt | Unit members, and admin when the limit is reached |
| Reminder for unscheduled parcel | Unit members |
| Unclaimed escalation | Unit members, admin |
| New task assigned | Executive |
| Join request pending | Admin |

### 7.2 Delivery rules
1. Every notification is first saved to the in-app inbox. The inbox is the reliable channel.
2. Push is sent in addition. Failure of push never blocks the business action.
3. Failed sends are retried with backoff, then marked failed and visible to admin.
4. Notifications contain minimal detail (no full address, no OTP). Sensitive detail appears only after opening the app.
5. Users can mute non-critical categories. Critical ones (out for delivery, OTP-related) cannot be muted.
6. Reminders are capped per parcel so residents are never spammed. Default cadence: day 1, day 3, then daily until the aging threshold, configurable.
7. SMS and WhatsApp fallbacks are post-pilot and must follow regulatory requirements for the region.

---

## 8. Background Job Rules

| Job | Purpose | Rule |
|---|---|---|
| Reminder dispatch | Send due reminders | Idempotent, skips parcels no longer eligible |
| Unclaimed aging | Move aged parcels to UNCLAIMED | Uses the state machine, never direct updates |
| Notification retry | Resend failed notifications | Bounded attempts with backoff |
| Slot cleanup | Close past slots, flag unfulfilled tasks | Flags to admin, does not auto-deliver |
| OTP expiry | Mark expired challenges | Safe to run repeatedly |
| Retention | Remove or anonymize expired data | Logged, reversible only through backups |

All jobs must be safe to run twice, must log their outcome, and must raise an alert on repeated failure.

---

## 9. Data Rules

1. **Required uniqueness:** one parcel per society, courier and tracking number among active records.
2. **Time:** store UTC, display in society timezone, and compute slot logic in society timezone.
3. **Soft versus hard delete:** parcels and audit entries are never hard deleted by the application. Retention jobs are the only path to removal.
4. **Referential integrity:** a parcel always belongs to a society and a unit. A unit always belongs to a society.
5. **Units and people:** parcels link to a unit. A named recipient is optional. A person can belong to multiple units and societies through membership records.
6. **QR codes:** contain only an opaque token. The server resolves it for authenticated, authorized users. Tokens for terminal parcels are invalid.
7. **Photos:** stored in private storage. Access is only through short-lived signed links issued after an authorization check. Photos are compressed on the client and size limited.

---

## 10. Privacy and Compliance Rules

1. Collect only what the workflow needs: name, phone, unit, relationship, parcel details and photos.
2. Show a consent notice at first login and record acceptance with version and time.
3. Define retention periods for parcel photos, parcel records, audit entries and inactive accounts. Defaults are set with legal advice and written in the society agreement.
4. Provide a process to export and delete a person's data on request, balanced against audit and legal retention needs.
5. Never use real resident data in non-production environments.
6. Access to production data by engineers is limited, logged and time bound.
7. Confirm current obligations under India's Digital Personal Data Protection Act 2023 with a qualified lawyer before pilot launch.
8. Report and handle personal data incidents according to a written incident procedure.

---

## 11. Offline and Resilience Rules

1. The reception flow must work without a connection and sync later. Other roles need a connection in the MVP.
2. Offline entries show a visible pending state and keep their original time of capture.
3. Sync is ordered and idempotent. Conflicts (for example, duplicates) are surfaced for human review, never silently merged or dropped.
4. A slow network must never block the guard: save first, upload photos and sync in the background.
5. The system degrades gracefully: if notifications are down, the business flow still works. If photo storage is down, registration still works.
6. Backups run daily, restores are tested on a schedule, and recovery targets are defined and documented.

---

## 12. API and Validation Rules

1. All input is validated against a shared schema on the server, regardless of client validation.
2. Errors use one consistent format with a stable code, a human-readable message and no internal detail.
3. List endpoints are paginated and filtered by default. No unbounded queries.
4. Mutating endpoints accept an idempotency key where repeats are likely (registration, booking, verification).
5. Rate limits apply to authentication, OTP, search and registration endpoints.
6. The API contract is documented and versioned. Breaking changes require a new version.
7. Free-text fields are length limited and sanitized for display.

---

## 13. UX Rules That Affect Design

1. Guard registration target: under 30 seconds per parcel, with barcode scanning first and typing as the fallback.
2. Every screen has a single primary action and one clear next step after it.
3. Errors explain what happened and what to do, in plain language.
4. Large tap targets, readable text and good contrast, usable on low-end Android phones and small screens.
5. Interface text supports English first, with room for Hindi and other regional languages later without redesign.
6. No feature depends on color alone. Status uses text and icons as well.
7. Anything destructive asks for confirmation and states the consequence.

---

## 14. Observability and Operations Rules

1. Structured logs with a request identifier, user, society and action. No secrets or personal data in logs.
2. Error tracking and uptime monitoring are active before pilot.
3. Key product metrics are captured from day one: parcels registered, time to register, share scheduled, on-time rate, failed-delivery rate, storage occupancy, adoption, staff time per parcel.
4. Alerts cover job failures, elevated error rates, notification failure spikes and unusual access patterns.
5. A written runbook covers outage, data incident, restore and staff change procedures.

---

## 15. Change Control

1. Changes to the state machine, slot rules, OTP rules, permission matrix or audit rules require a change note in this document and review before implementation.
2. Each rule has a corresponding test (unit, integration, concurrency or end-to-end). A rule without a test is not considered enforced.
3. Deferred features (lockers, courier APIs, billing, SMS OTP, payments) stay out of scope until the pilot decision gate is passed.

---

## 16. Rule-to-Test Map (summary)

| Rule area | Primary test type |
|---|---|
| State machine transitions | Unit: every legal and illegal move |
| Capacity and concurrent booking | Concurrency: many parallel bookings, capacity never exceeded |
| Cutoff and booking window | Unit and integration with controlled time |
| OTP expiry, lockout, single use | Unit and integration |
| Tenant isolation, object-level access | Integration: cross-society and cross-unit attempts |
| Audit atomicity and immutability | Integration: forced failure, permission checks |
| Duplicate registration | Integration |
| Offline sync and conflicts | End-to-end with simulated network loss |
| Notification failure tolerance | Integration with failing provider |
| Full journey | End-to-end: register, notify, schedule, assign, verify, deliver, plus failure paths |

# ParcelTime — System Architecture

| | |
|---|---|
| **Version** | 1.0 (MVP) |
| **Style** | Modular monolith, multi-tenant, event-assisted |
| **Related docs** | 01_PRD, 02_TRD, 06_System_Design_Rules |

---

## 1. Architectural Goals

1. **Correctness of custody.** The system must always know who holds a parcel and why.
2. **Simplicity for a pilot.** Few moving parts that a small team can run reliably.
3. **Safe growth.** Multi-society and higher volume must be possible without redesign.
4. **Isolation.** One society's or resident's data must never leak to another.
5. **Resilience at the edge.** Reception works on poor networks; notifications never block operations.

## 2. Architecture Style and Rationale

A **modular monolith**: one deployable API with strict internal module boundaries, one relational database, one worker process using the same codebase.

| Alternative | Why not for the MVP |
|---|---|
| Microservices | Operational overhead and distributed transactions are unjustified for one society. The README diagram shows separate services; treat these as modules, not deployables. |
| Serverless functions | Booking and state changes need transactions and row locks; cold starts hurt the guard-cabin experience. |
| Event sourcing | Too heavy. A relational model with an append-only audit log gives the needed history. |

Modules communicate through in-process interfaces and through an outbox table, so any module can be extracted later.

## 3. System Context

```text
 Resident (PWA)     Reception (PWA)     Executive (PWA)     Admin (Web)
        \                |                    |                  /
         \_______________|____________________|_________________/
                                   |
                            HTTPS (REST, JSON)
                                   |
                        +----------------------+
                        |   ParcelTime API     |-----> Firebase Cloud Messaging
                        |   (stateless)        |
                        +----------+-----------+
                                   |
              +--------------------+--------------------+
              |                    |                    |
       PostgreSQL            Private object        Worker process
   (data, job queue,         storage (parcel       (jobs, outbox
    outbox, audit)           and proof photos)      dispatcher)
```

External systems: push provider, object storage, email or SMS provider for invites and password reset (SMS deferred for general notifications), error tracking and uptime monitoring.

## 4. Containers

| Container | Responsibility | Notes |
|---|---|---|
| Web client | One React codebase delivering role-specific experiences: resident, reception, executive and admin. | PWA with service worker, offline queue for reception, push registration. |
| API service | Authentication, authorization, domain logic, validation, state machine, transactions. | Stateless, horizontally scalable. |
| Worker service | Runs scheduled and queued jobs, dispatches the outbox. | Same codebase as the API, separate process. |
| PostgreSQL | System of record, job queue, outbox, audit. | India region, backups, optional read replica later. |
| Object storage | Parcel photos and handover proof. | Private; access by signed URL only. |
| Push service | Delivers web push to devices. | Failures tolerated. |
| Observability stack | Logs, errors, metrics, uptime. | Request identifier ties them together. |

## 5. Backend Module Map

| Module | Responsibility | Depends on |
|---|---|---|
| Identity | Login, tokens, invites, password reset, sessions | Members |
| Tenancy and members | Societies, memberships, roles, units, unit membership, join requests | Identity |
| Storage locations | Physical storage places | Tenancy |
| Parcels | Registration, lookup, QR resolve, photos, return to courier | Tenancy, Storage, State machine, Files |
| State machine | The single place where parcel transitions are validated and applied | Audit, Outbox |
| Slots and scheduling | Templates, instances, booking, reschedule, cancel, blocking | Parcels, State machine |
| Tasks and delivery | Task creation, assignment, claim, start, failure | Scheduling, State machine |
| Handover | OTP challenges, verification, override | Tasks |
| Pickup | Self-pickup requests and completion | Parcels, Handover |
| Notifications | Outbox dispatch, in-app records, preferences, device tokens | Outbox, Push |
| Reports | Aggregated metrics and exports | Read-only access to others |
| Audit | Append-only event writing and querying | Called by State machine and sensitive modules |
| Files | Presigned upload and download, validation, retention | Object storage |
| Jobs | Scheduled and queued work | All via interfaces |
| Platform | Config, health, logging, rate limiting, error handling | All |

Dependency rule: modules depend downward on the list order above. Cross-module access goes through the module's public interface, never through another module's tables.

## 6. Key Runtime Flows

### 6.1 Parcel registration
1. Reception client sends a registration with an idempotency key.
2. API authenticates, checks role and society, validates input, rejects duplicate tracking numbers.
3. In one transaction: create the parcel, allocate Parcel ID and QR token, run the state transitions to IN_STORAGE, write audit, write an outbox event.
4. Client requests an upload permission and uploads the photo directly to storage, then confirms.
5. The worker dispatches the notification: in-app record plus push to the unit's active members.

### 6.2 Scheduling
1. Resident requests availability; API returns slot instances with remaining capacity.
2. Resident books; API runs the booking transaction with a row lock on the slot instance.
3. The same transaction creates the schedule and task, moves the parcel to SCHEDULED, audits, and writes outbox events.
4. Worker notifies the resident, and notifies reception and admin or the executive pool as configured.

### 6.3 Delivery and handover
1. Admin, reception or an executive assigns the task; the parcel moves to ASSIGNED.
2. At the slot, the executive scans the QR; API verifies assignment; parcel moves to OUT_FOR_DELIVERY; resident is notified.
3. Resident opens the handover screen; API creates a hashed, expiring OTP challenge and returns the code to the resident only.
4. Executive enters the OTP; API verifies in constant time with attempt limits.
5. On success: transition to DELIVERED, record the attempt, close the task, audit, notify.
6. On failure or absence: executive records a reason; parcel returns to storage; resident is asked to reschedule.

### 6.4 Notification dispatch
1. Business transactions write outbox events.
2. The dispatcher claims pending events, creates notification records, applies preferences, sends push, and marks results.
3. Failures retry with backoff, then alert.

### 6.5 Unclaimed ageing
A scheduled job scans in-storage parcels, sends escalating reminders, and after the society's threshold moves them to UNCLAIMED through the state machine with the system as actor.

## 7. Multi-Tenancy

- **Model:** shared database, shared schema, every tenant row carries the society identifier.
- **Enforcement layers:**
  1. The active society is a claim in the access token, verified on each request.
  2. A data-access layer automatically scopes queries by society; unscoped queries are not available to feature code.
  3. Database row-level security as a final safeguard.
- **Residents** are additionally scoped by unit membership.
- **Platform admin** access crosses societies only through an explicit, audited support path.
- **Growth path:** a society can be moved to its own database later because all access is scoped by society identifier.

## 8. Data Architecture

- **Operational data:** relational model in PostgreSQL as described in the TRD.
- **Time:** stored in UTC; presentation in society timezone; slot logic evaluated in society timezone.
- **Consistency:** strong consistency for parcels, schedules, slots and handover; eventual consistency acceptable for notifications and reports.
- **History:** append-only audit log is the authoritative history; notifications are a convenience.
- **Reporting:** run on primary for the pilot using indexed queries and daily aggregates if needed; add a replica when load requires.
- **Files:** objects keyed by society and parcel; references stored in the database; retention jobs remove expired files.

## 9. Security Architecture

| Layer | Controls |
|---|---|
| Edge | HTTPS only, secure headers, limited cross-origin access, rate limits. |
| Identity | Strong password hashing, short-lived access tokens, rotating refresh tokens in secure cookies, session revocation. |
| Authorization | Central policy checks combining role, society and unit; deny by default. |
| Data | Tenant scoping at three layers; encryption at rest and in transit; private storage; signed URLs. |
| Application | Schema validation at every boundary, parameterized queries through the ORM, output filtering of sensitive fields. |
| Operations | Secrets manager, least-privilege database users, audit of admin and support actions, dependency scanning. |
| Handover | Hashed OTP, expiry, attempt limits, override with reason and proof and flagged review. |

Trust boundaries: browser to API, API to database, API to storage, worker to external push. Input from clients is always untrusted, including state change requests and QR payloads.

## 10. Reliability and Resilience

| Concern | Approach |
|---|---|
| Push outage | In-app notifications continue; events retry; alerts raised. |
| Poor connectivity at reception | Local queue with idempotency keys; visible sync status. |
| Duplicate submissions | Idempotency keys on registration and sensitive actions. |
| Double booking | Row locking inside the booking transaction plus database check on counts. |
| Job failure | Jobs are idempotent with retry and dead-letter handling; queue depth is monitored. |
| Deployment safety | Health and readiness checks, rolling deploys, backward-compatible migrations. |
| Data loss | Daily backups, tested restores, point-in-time recovery if available. |
| Dependency slowness | Timeouts and circuit-style fallbacks for storage and push; core flows work without a photo when allowed. |

## 11. Deployment Topology

```text
 Users -> CDN / static hosting (web app)
       -> Load balancer -> API instances (2+, stateless)
                              |
                              +-> Managed PostgreSQL (primary, backups)
                              +-> Private object storage
 Worker instance (1+, runs jobs and dispatcher) -> same database, push provider
```

- Region: India for data residency and latency.
- Web and API share a parent domain so secure cookies work.
- Staging mirrors production at smaller size with synthetic data.
- One worker is enough for the pilot; job claiming is safe for more.

## 12. Observability

- **Logs:** structured, with request identifier, society, actor role and outcome; sensitive data masked.
- **Errors:** captured with context and request identifier.
- **Metrics:** request latency and error rate, booking conflicts, OTP failures and lockouts, notification success and failure, queue depth and age, job duration, storage occupancy.
- **Alerts:** elevated error rate, queue backlog, repeated notification failure, database saturation, backup failure, unusual override volume.
- **Business telemetry:** the pilot metrics in the PRD computed from audit and state data.

## 13. Architecture Decision Records (summary)

| ID | Decision | Reason | Revisit when |
|---|---|---|---|
| ADR-1 | Modular monolith | Simplicity, transactions | Multiple teams or independent scaling needs |
| ADR-2 | PostgreSQL for data, jobs and outbox | One system to run | Queue throughput or latency limits |
| ADR-3 | Shared schema multi-tenancy with row-level security | Cheap, simple, safe enough | Large enterprise or regulatory isolation demands |
| ADR-4 | Single backend state machine | Prevent illegal states | Never; extend, do not bypass |
| ADR-5 | Outbox for notifications | Decouple delivery from custody | Moving to a broker |
| ADR-6 | PWA instead of native apps | One codebase, fast iteration | Push reliability or hardware needs (lockers) |
| ADR-7 | Resident-displayed OTP | Avoids SMS cost and DLT setup | Residents without smartphones; add SMS |
| ADR-8 | Private object storage with signed URLs | Privacy | Never |
| ADR-9 | No realtime channel in core | Fewer failure modes | Task list latency complaints |
| ADR-10 | Opaque QR tokens | No personal data on labels | Never |

## 14. Evolution Path

| Stage | Change |
|---|---|
| After pilot | SMS and WhatsApp channels via the notification module; richer reports. |
| Multi-society | Onboarding tooling for platform admin; per-society configuration templates; support tooling. |
| Scale | Read replica for reports; separate worker pools; CDN for images through signed delivery. |
| Locker integration | New "storage location type" and a locker adapter module behind the handover interface. |
| Courier integrations | Inbound adapter module that pre-registers expected parcels and feeds the same state machine. |
| Native apps | Wrap or rebuild clients against the same API. |

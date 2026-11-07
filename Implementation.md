# ParcelTime: Implementation Plan

Version 1.0 (MVP). Companion to 01_PRD, 02_TRD, 03_Architecture, 04_MVP_Screens, 05_User_Flows, 06_System_Design_Rules.

This plan turns the documents into an executable build. It contains no code. Estimates assume 2 developers plus part-time design and QA. A solo developer should plan on about 1.5 times the duration.

---

## 1. Idea Analysis

### 1.1 What ParcelTime is
A parcel custody and scheduled-delivery layer for gated residential societies. Couriers drop parcels at the gate. Reception registers them, residents get notified and choose a delivery slot or self-pickup, and staff deliver with OTP verification and a full audit trail.

### 1.2 Why it can work
- The pain is real and daily: gate chaos, lost parcels, residents missing couriers, guards acting as informal warehouse staff.
- The workflow is narrow and well defined, so the MVP can be small.
- A single society is a contained pilot with clear success metrics.
- Switching cost is low for the society, since it adds a layer and replaces nothing.

### 1.3 What decides success
| Factor | Why it matters | How the plan responds |
|---|---|---|
| Guard adoption | If registration is slow, guards skip it and the system has no data | Barcode-first, 30-second target, offline queue, tested with real guards |
| Operations | Staffing, storage space and liability matter more than code | Ops workstream runs in parallel with engineering |
| Slot integrity | Overbooking breaks trust | Capacity enforced in the database and concurrency tested |
| Notification reliability | A missed notification means an unclaimed parcel | In-app inbox as the reliable channel, push as an add-on |
| Trust and privacy | Residents share phone, unit and photos | Strict tenant isolation, audit, consent, retention rules |
| Unit economics | Staff time per parcel decides viability | Pilot metrics feed pricing decisions |

### 1.4 Key risks (ranked)
1. Guard and staff adoption.
2. Courier policy conflicts or refusal to leave parcels at the gate.
3. Staffing shortfall against booked slots.
4. Notification misses leading to unclaimed storage buildup.
5. Privacy incident or cross-society data leak.
6. Scope creep before the pilot gate.
7. Free-tier or weak infrastructure used for the pilot.

### 1.5 Explicitly out of scope until the pilot gate
Smart lockers, courier API integrations, billing and payments, SMS and WhatsApp OTP, multi-language beyond English-ready structure, multi-society marketplace features.

---

## 2. Guiding Principles

1. **Design the core once.** The data model, state machine and slot-booking transaction are the three decisions that are costly to change. Spend the most design time there.
2. **Ship vertical slices.** Each phase ends with something a real user could try, not a layer of plumbing.
3. **Rules are tests.** Every rule in 06_System_Design_Rules has a test. No rule is considered enforced without one.
4. **Operations first-class.** Guard training, custody policy and storage layout are deliverables, not afterthoughts.
5. **Keep the stack boring.** Fewer moving parts means fewer pilot-day surprises.

---

## 3. Workstreams

| Workstream | Owner | Scope |
|---|---|---|
| A. Product and design | Product lead, designer | Flows, screens, copy, usability tests |
| B. Backend | Backend dev | API, data model, state machine, jobs, security |
| C. Frontend | Frontend dev | PWA for all roles, offline reception, notifications |
| D. Platform and DevOps | Either dev, shared | Repo, CI/CD, environments, monitoring, backups |
| E. Quality | Shared, QA part-time | Test strategy, automation, device testing |
| F. Operations and legal | Founder or ops lead | Society agreement, custody policy, consent, staff training, data protection review |

Workstream F runs from week 1 and has hard deadlines before the pilot.

---

## 4. Phased Roadmap (about 13 weeks to pilot-ready)

### Phase 0: Discovery and Foundations (Week 1)
**Goal:** Remove ambiguity and make the project buildable.

Deliverables:
- Shadow a real parcel-handling shift. Record every step, delay and workaround.
- Validate the state machine and flows against what actually happens at the gate.
- Freeze the data model and slot rules.
- Choose and confirm the stack, hosting region and third-party services.
- Set up the monorepo, linting, type checking, CI skeleton, environment configuration template and staging.
- Draft the custody and liability policy and the resident consent notice.
- Pick the pilot society and agree the staffing and storage space with management.

Exit criteria: Sign-off on data model, state machine and slot rules. Staging exists. Pilot society confirmed in principle.

### Phase 1: Core Platform (Weeks 2 to 3)
**Goal:** A secure, tenant-aware backbone.

Deliverables:
- Authentication with invite-based onboarding and admin approval.
- Session handling with rotating refresh tokens.
- Role and permission enforcement matching the permission matrix.
- Tenant scoping at the application and database levels.
- Schema and migrations for all core entities.
- Seed data for a demo society.
- Append-only audit log foundation.
- Structured logging, error tracking and health checks.

Exit criteria: A user can sign in; a cross-society access attempt fails in an automated test; audit rows are created for auth and role events.

### Phase 2: Society Setup (Weeks 4 to 5)
**Goal:** An admin can fully configure a society without engineering help.

Deliverables:
- Unit import with validation and error report.
- Staff and resident management, join-request approval.
- Storage location management.
- Slot template and capacity configuration, cutoff and booking window settings.
- Society-level rules: unclaimed days, reminder cadence, attempt limits.
- Admin and resident app shells with navigation and role switching.

Exit criteria: A new society can be configured end to end from a unit file in under an hour.

### Phase 3: Reception (Weeks 6 to 7)
**Goal:** Guards can register parcels fast and residents get told.

Deliverables:
- Mobile-first receive flow with barcode scanning, unit typeahead, photo capture and storage location.
- Duplicate detection and unknown-unit handling.
- Parcel state machine with the single transition entry point.
- QR token generation and resolution.
- Offline queue with pending state and ordered sync.
- Resident notifications: in-app inbox and push.
- Resident parcel list and detail views.

Exit criteria: Registration takes under 30 seconds in timed tests on a mid-range Android phone. Offline registration syncs correctly. Resident sees the parcel within seconds of registration.

### Phase 4: Scheduling (Weeks 8 to 9)
**Goal:** Residents can book reliably and staff can plan.

Deliverables:
- Slot availability view with remaining capacity.
- Transactional booking, reschedule and cancel.
- Cutoff and booking window enforcement.
- Concurrency tests that prove capacity is never exceeded.
- Task creation from bookings.
- Admin planning screen grouped by slot and tower, with assignment.
- Pool-and-claim mode for executives.
- Capacity reduction and slot closure with affected-booking handling.
- Reminder jobs.

Exit criteria: Parallel booking tests pass repeatedly. Admin can plan a full day of deliveries and reassign tasks.

### Phase 5: Delivery (Weeks 10 to 11)
**Goal:** Close the loop with verified handover.

Deliverables:
- Executive task list grouped by tower and floor.
- Collection from storage with QR scan and custody handoff record.
- OTP generation on the resident side, hashed storage, expiry, attempt limit and single use.
- Handover verification and delivery confirmation.
- Failed attempt flow with mandatory reasons and return to storage.
- Self-pickup flow at the guard cabin.
- Delegate and family-member handling.
- Unclaimed aging job, escalation notices, return-to-courier flow.

Exit criteria: The full seven-step journey works on staging, including each failure path from 05_User_Flows.

### Phase 6: Hardening and Pilot Readiness (Weeks 12 to 13)
**Goal:** Make it safe to put in front of real people.

Deliverables:
- Admin dashboard and exceptions list with the pilot metrics.
- Report export.
- Security review against common web risks, including object-level access and rate limits.
- Load and concurrency testing at several times expected pilot volume.
- Accessibility and low-end device checks, throttled network tests.
- Backup restore drill and incident runbook.
- Production environment, monitoring, alerts and uptime checks.
- API documentation.
- Staff training material and resident quick-start guide.
- Legal review of consent, retention and the society agreement completed.

Exit criteria: Go or no-go checklist (section 9) is fully green.

---

## 5. Milestone Calendar

| Week | Milestone |
|---|---|
| 1 | Discovery complete, data model and state machine frozen |
| 3 | Secure platform with tenant isolation proven |
| 5 | Society configurable end to end |
| 7 | Reception live on staging, offline sync works |
| 9 | Booking and planning proven under concurrency |
| 11 | Full delivery journey works end to end |
| 13 | Pilot-ready, go or no-go decision |
| 14 to 15 | Training, soft launch with guards only |
| 16 to 21 | Pilot with residents, weekly review |
| 22 | Pilot decision gate |

---

## 6. Environments and Release Process

| Environment | Purpose | Data |
|---|---|---|
| Local | Development | Seed data only |
| Staging | Integration, demos, training | Seeded demo society, no real resident data |
| Production | Pilot | Real data under the retention and access rules |

Release rules:
1. Every change goes through review and passes lint, type checks, unit and integration tests, and migration checks.
2. Staging deploys automatically on merge.
3. Production deploys only through a manual approval step.
4. Database migrations are backward compatible for one release so rollback is possible.
5. Every production release has a written rollback step.
6. Feature flags protect anything risky, such as pool-and-claim mode or offline sync changes.

---

## 7. Quality Plan

### 7.1 Test layers
| Layer | Focus |
|---|---|
| Unit | State machine transitions, slot availability, OTP rules, permission matrix |
| Integration (real database) | Persistence, atomic audit writes, tenant isolation, duplicate prevention |
| Concurrency | Parallel bookings, parallel claims, double submissions |
| End to end | Full journey plus invalid OTP, unauthorized parcel access, failed delivery, reschedule, offline reception |
| Non-functional | Small-screen Android, throttled network, accessibility, basic security review |

### 7.2 Quality gates per phase
- No phase closes with failing rule tests.
- Any bug that touches custody, capacity or access control is fixed before new work starts.
- Usability tests with real guards happen at the end of phase 3 and again in phase 5.

### 7.3 Definition of done (every feature)
1. Matches the relevant flow in 05_User_Flows and rule in 06_System_Design_Rules.
2. Tests exist for the rules it touches.
3. Errors are handled with clear messages and next steps.
4. Audit entries are written where required.
5. Works on a small Android screen and a slow network.
6. Documented in the API reference where applicable.

---

## 8. Operations Workstream (parallel to engineering)

| When | Activity |
|---|---|
| Week 1 | Pilot society agreement outline: staffing, storage space, gate access, roles |
| Weeks 2 to 4 | Custody and liability policy: lost or damaged parcels, who is responsible, claims process |
| Weeks 4 to 6 | Consent notice and data handling summary reviewed by a lawyer, including India's DPDP Act 2023 obligations |
| Weeks 6 to 8 | Storage layout: racks, labels, zones by tower or unit range |
| Weeks 8 to 10 | Courier outreach: start with couriers already dropping at the gate |
| Weeks 10 to 12 | Guard and executive training plan and materials |
| Week 13 | Resident launch communication plan |
| Weeks 14 to 15 | Guards-only soft launch with daily check-ins |

---

## 9. Go or No-Go Checklist for Pilot

**Product**
- [ ] Full journey works on production with test parcels.
- [ ] All failure paths in 05_User_Flows verified.
- [ ] Registration time under 30 seconds in real conditions.

**Security and privacy**
- [ ] Cross-society and cross-unit access tests pass.
- [ ] Rate limits and lockouts verified.
- [ ] Audit log is append-only and written atomically.
- [ ] Consent notice live and acceptance recorded.
- [ ] Retention and deletion process documented.

**Reliability**
- [ ] Concurrency tests pass repeatedly.
- [ ] Backup restore tested successfully.
- [ ] Monitoring, alerts and uptime checks active.
- [ ] Runbook reviewed with the team.

**Operations**
- [ ] Society agreement signed.
- [ ] Custody and liability policy approved by management.
- [ ] Guards and executives trained and have logins.
- [ ] Storage space prepared and labelled.
- [ ] Support contact and escalation path published to residents.

---

## 10. Pilot Plan

### 10.1 Structure
1. **Soft launch (1 to 2 weeks):** Guards register parcels and notifications go to a small group of volunteer residents.
2. **Full pilot (4 to 6 weeks):** All residents invited, scheduling and delivery live.
3. **Review:** Weekly review of metrics and feedback, with a final decision gate.

### 10.2 Metrics
| Metric | Target to learn |
|---|---|
| Parcels registered per day | Volume and load |
| Average registration time | Guard adoption and speed |
| Resident adoption (joined versus total units) | Reach |
| Share of parcels scheduled versus self-picked-up | Demand for delivery |
| On-time delivery rate | Service quality |
| Failed-delivery rate and reasons | Process and resident behavior |
| Storage occupancy and aging | Space and escalation needs |
| Unclaimed rate | Notification effectiveness |
| Staff hours per parcel | Unit economics |
| Support issues per week | Product and training gaps |

### 10.3 Decision gate
Proceed to the next stage only if:
- Guards use the system for nearly every parcel without prompting.
- Residents adopt at a level that justifies the staffing.
- Staff time per parcel supports a viable price.
- No unresolved custody or privacy incident.

Then decide among: onboarding more societies, locker integration, courier APIs, billing, and SMS or WhatsApp fallback. Price the service from measured handling cost.

---

## 11. Team and Responsibilities

| Role | Responsibilities |
|---|---|
| Product lead | Scope, priorities, pilot relationship, metrics |
| Designer (part-time) | Flows, screens, usability testing with guards |
| Backend developer | Data model, state machine, booking transaction, security, jobs |
| Frontend developer | PWA, offline reception, role-based screens |
| QA (part-time) | Test plans, device testing, regression |
| Ops and legal lead | Society agreement, policy, consent, training, courier outreach |

For a solo developer: sequence phases the same way, drop analytics polish and pool-and-claim mode to later, and keep ops work with the founder.

---

## 12. Risk Register and Mitigations

| Risk | Likelihood | Impact | Mitigation | Early signal |
|---|---|---|---|---|
| Guards bypass the system | High | High | Barcode-first, offline support, guard co-design, daily check-ins in soft launch | Parcels in storage not in the system |
| Courier refuses gate drop | Medium | High | Start with couriers already dropping, get management sign-off | Parcels turned away |
| Staff shortage against bookings | Medium | Medium | Capacity tied to staffing, admin can reduce slots | Slots frequently over capacity |
| Notifications missed | Medium | High | In-app inbox, reminders, escalation, post-pilot SMS | High unclaimed rate |
| Data leak across societies | Low | Severe | Scoped queries, row-level security, isolation tests, signed photo links | Any test failure in isolation suite |
| Overbooking | Low | High | Database-enforced capacity, concurrency tests | Duplicate bookings in logs |
| Scope creep | High | Medium | Deferred list held until the gate | New requests mid-phase |
| Infrastructure instability | Medium | High | Paid managed database, backups, monitoring, regional hosting | Cold starts, slow responses |
| Schedule slip | Medium | Medium | Weekly milestone check, cut scope not quality | Phase exit criteria missed |
| Legal or consent gap | Medium | High | Lawyer review before pilot | Review not complete by week 10 |

---

## 13. Dependencies and Assumptions

**Dependencies**
- A cooperative pilot society with committed staff and storage space.
- Push notification service, private object storage, managed database and hosting in an Indian region.
- Domain with same-site subdomains for web and API.

**Assumptions**
- Most residents use Android phones.
- Guards have access to a smartphone or shared tablet.
- Couriers already leave parcels at the gate.
- One society in the pilot, with a few hundred units.

If an assumption fails (for example, guards have no usable device), revisit the reception flow before building further.

---

## 14. Immediate Next Steps (first 10 working days)

1. Confirm the pilot society and schedule shift-shadowing sessions.
2. Review the state machine and flows with a guard and an admin from that society.
3. Freeze the data model and slot rules.
4. Set up the monorepo, CI, linting and staging.
5. Decide push provider, storage provider and hosting region.
6. Start the custody policy and consent notice drafts.
7. Prepare clickable prototypes of the receive flow and test with guards before building it.
8. Agree the weekly review ritual and the phase exit criteria with everyone involved.

---

## 15. Post-Pilot Roadmap (indicative)

| Stage | Possible scope | Trigger |
|---|---|---|
| Stabilize | Fixes from pilot feedback, performance tuning, better reports | Pilot end |
| Notify better | SMS or WhatsApp fallback, language support | High unclaimed rate or low app adoption |
| Scale | Onboard more societies, platform admin tooling | Positive unit economics |
| Integrate | Courier integrations, locker support | Stable volume and partner interest |
| Monetize | Pricing, invoicing, billing | Measured handling cost known |
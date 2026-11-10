# ParcelTime — Live Shipment Integration Architecture

**Document type:** Product, technical architecture and implementation proposal  
**Status:** Proposed  
**Objective:** Automatically discover incoming shipments, track supported carriers, and connect external courier delivery to ParcelTime's internal residential handover workflow.

## 1. Executive summary

ParcelTime should not depend entirely on residents manually entering every parcel. It should implement a **Unified Shipment Ingestion Engine (USIE)** that accepts shipment information from multiple authorized sources, normalizes it, detects duplicates, tracks supported shipments and manages the final handover inside a residential community.

There are two distinct problems:

1. **Shipment discovery:** How does ParcelTime learn that a shipment exists?
2. **Shipment tracking:** How does ParcelTime learn where that shipment is?

Recommended MVP:
- Manual tracking and share-to-ParcelTime as universal fallbacks.
- Gmail integration for automated discovery, subject to Google OAuth approval and privacy review.
- One multi-carrier tracking aggregator for tracking-number-based updates.
- Reception registration to establish physical custody.
- Direct marketplace/carrier integrations only when documented access and authorization are available.

Do not make Amazon or Flipkart consumer-account API access a launch dependency.

> A courier marking a parcel “delivered” does not mean the resident has received it. External courier status and ParcelTime's internal custody/handover status must remain separate.

## 2. Problem definition

A resident may order from Amazon, Flipkart, Myntra, Meesho or an independent retailer. The retailer may ship through Delhivery, Blue Dart, FedEx, Ecom Express, India Post or another carrier.

These systems hold different data:
- **Marketplace:** order and fulfilment information.
- **Carrier:** tracking number, scans, location, exceptions and delivery events.
- **ParcelTime:** verified resident association, society receipt, storage, scheduling and final handover.

These systems do not automatically expose all their data to every third-party application. API access depends on the provider's product, account type, permissions, commercial terms, geography and use case.

### Product goals
1. Discover eligible shipments with minimal resident effort.
2. Track shipments across supported carriers.
3. Avoid duplicate records when multiple sources identify the same package.
4. Show source attribution and last-updated time.
5. Notify residents only when an event requires awareness or action.
6. Match shipments to verified residents safely.
7. Preserve chain of custody after society receipt.
8. Provide manual and human-assisted fallbacks.

### Non-goals for the first release
- Scraping logged-in shopping websites.
- Collecting shopping-site passwords.
- Reading every email or notification indiscriminately.
- Claiming universal live tracking for every carrier.
- Treating a carrier's “delivered” scan as proof of resident handover.
- Building a microservice platform before it is justified.

## 3. Data acquisition strategy

| Source | What it provides | Advantages | Limitations | Recommendation |
|---|---|---|---|---|
| Gmail API | Order/shipping emails, tracking number, carrier, ETA when present | Broad merchant coverage for users receiving emails | OAuth verification, scope restrictions, inconsistent templates | Primary automated discovery, subject to approval |
| Direct marketplace API | Order/shipment data | Structured and potentially authoritative | Consumer order APIs may not be available to arbitrary third parties | Pursue only via documented authorized programs |
| Tracking aggregator | Carrier events, checkpoints, ETA where supported | One interface for many carriers | Coverage, plans, limits and account requirements vary | Primary tracking layer |
| Direct carrier API/webhook | Carrier-specific tracking and proof data | Potentially richer information | Separate onboarding and maintenance | Add selectively |
| Share/forward to ParcelTime | Tracking text/email shared by resident | Low-friction fallback | Requires user action | MVP fallback |
| Manual entry | Tracking number and carrier | Universal fallback | Manual effort and typos | Always support |
| Reception registration | Physical receipt at society | Establishes custody | Does not provide upstream journey | Always support |

**Key distinction:** A tracking aggregator is usually a tracking source, not a universal order-discovery source. It normally needs a tracking number and sometimes a carrier identifier. ParcelTime still needs a way to discover those details.

## 4. Recommended reference patterns and industry best practices

### 4.1 Multi-carrier tracking

AfterShip's Tracking API documents tracking creation using a tracking number and optional courier slug, courier detection, tracking retrieval and webhook notifications. It also documents webhook HMAC signatures. Carrier coverage, pricing, rate limits and account-specific carrier requirements must be checked before committing to support.

ParcelTime should:
- Hide provider-specific behavior behind an adapter.
- Register tracking only after a valid tracking number is discovered.
- Store the provider tracking ID separately from ParcelTime's shipment ID.
- Receive updates through webhooks.
- Use API reads for reconciliation, not constant high-frequency polling.
- Check whether each target carrier is globally supported or requires a connected carrier account.

### 4.2 Gmail push notifications

The Gmail API supports mailbox watches and push notifications through Google Cloud Pub/Sub. A push notification signals mailbox changes; the backend then uses Gmail history/message APIs to retrieve relevant changes. Google notes notifications can be delayed or dropped in exceptional cases, so periodic history synchronization is required. Watches expire and must be renewed.

ParcelTime should:
- Obtain explicit Gmail OAuth consent.
- Request the narrowest scopes that support the approved feature.
- Configure Gmail watch and Pub/Sub.
- Fetch changes through the Gmail history API.
- Filter likely shipment messages.
- Extract and validate shipment fields.
- Store only the minimum required shipment data.
- Renew watches and run incremental reconciliation.

### 4.3 Carrier webhook processing

FedEx's webhook guidance recommends treating every payload as a shipment state update, merging new information instead of overwriting the record, handling repeated payloads for the same milestone, processing prior events where provided, and using business rules to decide when to notify customers.

ParcelTime should:
- Persist each inbound event before asynchronous processing.
- Deduplicate events.
- Merge shipment attributes and preserve history.
- Handle out-of-order updates.
- Avoid triggering notifications from raw event codes alone.
- Use notification rules and resident preferences.

### 4.4 OAuth and sensitive data governance

Google documents additional verification for sensitive and restricted OAuth scopes. Restricted-scope server-side access can require an independent security assessment. Requirements depend on the exact scopes and usage.

Treat Gmail approval as a launch workstream, not an assumption. Confirm scope classification, consent disclosures, privacy policy, deletion process and assessment requirements before promising a launch date.

## 5. Proposed architecture

```text
                 SHIPMENT DISCOVERY SOURCES
  +--------------+--------------+---------------+--------------+
  |              |              |               |              |
 Gmail OAuth  Authorized APIs  Share/Forward  Manual/Reception
  |              |              |               |
  +--------------+--------------+---------------+
                         |
                         v
              UNIFIED INGESTION ENGINE
                         |
             +-----------+-----------+
             |                       |
       Source adapters          Validation
             |                       |
             +-----------+-----------+
                         |
                         v
              NORMALIZATION + MATCHING
                         |
             +-----------+-----------+
             |           |           |
         Deduplication Resident   Consent/policy
                       matching
             +-----------+-----------+
                         |
                         v
                  SHIPMENT DATABASE
                         |
                         v
               TRACKING PROVIDER ADAPTER
                    /             \
              Aggregator       Direct carrier
                    \             /
                         |
                         v
                  WEBHOOK INGESTION
                         |
                         v
              EVENT STORE + PROCESSOR
                         |
              +----------+----------+
              |                     |
        State projection      Notification rules
              |                     |
              +----------+----------+
                         |
                         v
                 RESIDENT EXPERIENCE
                         |
                         v
              SOCIETY RECEIPT + CUSTODY
                         |
                         v
               INTERNAL DELIVERY / PICKUP
                         |
                         v
                 VERIFIED HANDOVER
```

### Core principles
1. Provider adapters isolate vendor-specific payloads.
2. Discovery and tracking are separate capabilities.
3. All sources map into a canonical ParcelTime model.
4. Preserve incoming events; derive current state from event history.
5. Use webhooks first and reconciliation as a safety net.
6. Every data source has explicit authorization and consent.
7. Ambiguous matches require human confirmation.

## 6. End-to-end workflows

### 6.1 Gmail discovery
1. Resident selects **Connect Gmail** and reviews a clear data-use explanation.
2. Resident completes Google OAuth.
3. Backend stores encrypted credentials and granted scopes, if token retention is necessary.
4. Backend creates a Gmail watch and stores its expiry and history cursor.
5. Pub/Sub notifies ParcelTime of mailbox changes.
6. A worker fetches changed messages through Gmail history APIs.
7. A classifier identifies likely order/shipping messages.
8. A deterministic parser extracts available fields; a constrained LLM can be a fallback.
9. Validate fields and assign confidence.
10. Match to a verified resident or ask for confirmation.
11. Create/link a shipment record.
12. Register a tracking number with the tracking provider if available.

A Gmail push notification is not the message content. It signals mailbox changes. ParcelTime must retrieve relevant messages through authorized Gmail APIs. Periodic history reconciliation is needed to recover missed notifications.

### 6.2 Tracking
1. Shipment discovery yields a tracking number and possibly a carrier.
2. Validate the tracking number and source.
3. Resolve the courier using known carrier data or provider detection.
4. Register tracking with an aggregator or direct carrier adapter.
5. Store provider tracking ID and registration result.
6. Receive webhook update.
7. Verify webhook authenticity.
8. Persist the event and enqueue processing.
9. Deduplicate and normalize.
10. Update the shipment projection and timeline.
11. Evaluate notification rules.
12. Reconcile active shipments periodically.

### 6.3 Society receipt and handover

**External courier lifecycle**
```text
LABEL_CREATED -> PICKED_UP -> IN_TRANSIT -> OUT_FOR_DELIVERY
              -> DELIVERED_TO_SOCIETY / DELIVERED
              -> EXCEPTION / ATTEMPTED / RETURNED
```

**ParcelTime internal lifecycle**
```text
EXPECTED -> RECEIVED_AT_GATE -> VERIFIED_AT_RECEPTION -> STORED
         -> READY_FOR_PICKUP / SCHEDULED -> ASSIGNED_TO_EXECUTIVE
         -> OUT_FOR_INTERNAL_DELIVERY -> DELIVERED_TO_RESIDENT
```

A carrier's `DELIVERED` event is an external carrier assertion. Reception staff must confirm physical receipt, resident/apartment, parcel condition and storage location. Only a verified OTP or approved handover process should complete the internal resident-delivery state.

## 7. Unified Shipment Ingestion Engine (USIE)

USIE should initially be a module inside the existing backend, not a separate microservice.

### Responsibilities
- Accept shipment candidates from multiple sources.
- Validate source authorization and payload shape.
- Normalize source-specific fields.
- Match candidates to existing shipments.
- Resolve resident identity safely.
- Detect duplicates and conflicts.
- Create/update shipment records.
- Dispatch tracking-registration jobs.
- Record ingestion and synchronization outcomes.
- Maintain an audit trail.

### Suggested module layout

```text
src/
  integrations/
    gmail/
      gmail.oauth.ts
      gmail.watch.ts
      gmail.history.ts
      gmail.adapter.ts
    marketplaces/
      marketplace.adapter.ts
    tracking/
      tracking-provider.interface.ts
      aftership.adapter.ts
      shiprocket.adapter.ts
      carrier.adapter.ts
  ingestion/
    ingestion.service.ts
    source-validator.ts
    shipment-normalizer.ts
    shipment-matcher.ts
    duplicate-detector.ts
    confidence-scorer.ts
  webhooks/
    tracking-webhook.controller.ts
    webhook-verifier.ts
    webhook-inbox.service.ts
  shipments/
    shipment.service.ts
    shipment-state-projector.ts
    shipment-event.service.ts
  notifications/
    notification-rules.ts
  workers/
    gmail-sync.worker.ts
    tracking-register.worker.ts
    tracking-event.worker.ts
    reconciliation.worker.ts
    gmail-watch-renewal.worker.ts
```

## 8. Provider adapter contract

Use a provider-neutral interface so new tracking providers do not change core shipment logic.

Illustrative TypeScript:

```ts
export interface TrackingProvider {
  createTracking(input: {
    trackingNumber: string;
    carrierCode?: string;
    reference?: string;
  }): Promise<{
    providerTrackingId: string;
    normalizedCarrier?: string;
    status: "registered" | "pending" | "failed";
  }>;

  getTracking(providerTrackingId: string): Promise<{
    status: string;
    events: NormalizedTrackingEvent[];
    estimatedDeliveryAt?: string;
  }>;

  verifyWebhook(
    rawBody: Buffer,
    headers: Record<string, string | string[] | undefined>
  ): Promise<boolean>;

  normalizeWebhook(payload: unknown): Promise<NormalizedTrackingEvent[]>;
}
```

This is an architectural contract, not a copy-paste implementation. Follow each provider's current authentication, signature and payload specifications.

## 9. Canonical data model

Adapt these entities to the existing PostgreSQL/Prisma schema instead of duplicating existing models.

### `ExternalIntegration`
- `id`, `tenantId`, `userId`
- `provider` (e.g. `GMAIL`)
- `status` (`ACTIVE`, `EXPIRED`, `REVOKED`, `ERROR`)
- `grantedScopes`
- encrypted access/refresh token fields, only if required
- `watchExpiresAt`, `lastCursor`, `lastSyncedAt`
- timestamps

### `Shipment`
- `id`, `tenantId`, `residentId`
- `orderReference` (optional)
- protected tracking number and searchable hash
- canonical carrier code
- discovery source
- `externalStatus`
- `internalStatus`
- `estimatedDeliveryAt`
- `lastCarrierEventAt`, `lastSyncedAt`
- match confidence and timestamps

One order can split into multiple shipments; several products can also be consolidated into one shipment. Model the physical shipment separately from the retail order.

### `ShipmentSourceReference`
Links several sources to one physical shipment:
- `id`, `shipmentId`, `sourceType`
- external reference/hash
- minimized source metadata
- timestamp

Examples include Gmail message ID, marketplace shipment reference, user-submitted tracking reference and reception registration reference.

### `ShipmentEvent`
Append-only external and internal event history:
- `id`, `shipmentId`
- `eventDomain` (`EXTERNAL_CARRIER` / `INTERNAL_CUSTODY`)
- event code and normalized status
- description and location
- `occurredAt`, `receivedAt`
- source provider and provider event ID
- payload hash/reference
- timestamp

### `WebhookInbox`
Durable inbound webhook record:
- provider, provider event ID
- idempotency key and payload hash
- received time
- processing status, attempt count, last error, processed time

Use a unique constraint on provider + provider event ID when the provider supplies a stable ID.

### `IntegrationSyncLog`
Track integration ID, sync type, cursor, start/end time, status, retry count, error category and next retry time.

## 10. Matching and duplicate detection

A shipment may be found through Gmail, a marketplace integration, a shared message and reception registration. Do not create four shipment records.

### Matching priority
1. Normalized carrier + tracking number.
2. Merchant shipment/fulfilment ID.
3. Marketplace order ID + package/shipment reference.
4. Verified resident + tracking number.
5. Verified resident + carrier + compatible delivery window plus supporting signals.

Do not merge based only on product name, resident name or approximate delivery date.

### Matching outcomes
- **Exact:** Link source to existing shipment.
- **High confidence:** Auto-link under a documented rule and record why.
- **Ambiguous:** Ask resident or authorized reception staff.
- **Conflict:** Preserve source records and create a review task; never silently overwrite.

### Resident matching
Use verified ParcelTime resident identity, apartment association and permitted address/phone/email signals. A name alone is insufficient. Enforce tenant boundaries in every query.

## 11. Webhook reliability and event processing

### Webhook-first, polling-backed
Use webhooks where supported. Poll only when:
- A provider has no webhook.
- An active shipment needs reconciliation.
- A webhook may have been missed.
- A critical state needs verification.

Respect provider rate limits and pricing. Reduce polling after terminal states, with controlled rechecks for exceptions.

### Processing pattern
1. Receive over HTTPS.
2. Verify signature against the exact raw request body as specified by provider.
3. Reject invalid signatures.
4. Persist to `WebhookInbox`.
5. Acknowledge promptly after durable acceptance.
6. Process asynchronously.
7. Deduplicate.
8. Normalize and merge the event.
9. Update state projection.
10. Evaluate notification rules.
11. Retry transient errors; dead-letter exhausted failures.

### Reliability requirements
- Stable provider event ID or deterministic fallback idempotency key.
- Handle duplicate and out-of-order events.
- Preserve event time and received time separately.
- Merge incremental data; do not replace the entire shipment record.
- Use exponential backoff with jitter.
- Provide dead-letter inspection and safe replay.
- Use a transactional outbox when a database update must trigger downstream jobs/notifications.
- Reconcile active shipments and Gmail history cursors periodically.

A repeated `OUT_FOR_DELIVERY` payload may contain a new ETA or other enrichment. Do not discard it just because the status did not change.

## 12. Gmail implementation and privacy

Gmail is a promising discovery channel, but not universal: users may use another mailbox, disable email updates, receive incomplete messages or order using a different address.

### User experience
- Explain precisely what data is accessed and why.
- Provide **Connect Gmail** through Google OAuth.
- Request the narrowest approved scope.
- Show connection state and last sync.
- Provide disconnect, revoke and deletion controls.
- Keep manual/share-based entry available.

### Extraction strategy: deterministic first
1. Known sender/template rules.
2. Stable headers and structured message data where available.
3. Parsers/regular expressions for tracking numbers and dates.
4. Constrained LLM fallback for unfamiliar templates.
5. Schema validation and confidence scoring.
6. User confirmation for uncertain matches.

The LLM must not invent missing tracking numbers or guess a carrier without evidence. Treat email content as untrusted input and defend against prompt injection. The model should return a strict schema; it must not execute privileged application actions.

### Data minimization
Prefer storing merchant/source, necessary order/shipment reference, protected tracking number, carrier, ETA, shipment events, source message reference and extraction confidence.

Avoid storing full mailbox contents, unrelated emails, payment credentials or invoices unless a separately justified feature requires them.

### Production readiness
- Confirm the exact Gmail scopes and classification.
- Review OAuth verification and security assessment requirements.
- Prepare consent disclosures, privacy policy and deletion process.
- Test watch renewal, Pub/Sub permissions, history cursor recovery and revocation.
- Provide manual/share fallback while approval is pending.

## 13. Marketplace and carrier realities

### Amazon
Amazon has multiple API products for different business use cases. Selling Partner APIs are designed around seller/vendor operations and authorized applications; do not assume they grant arbitrary third-party access to a consumer's personal order history. Amazon Business documents package tracking for eligible business use cases, which is not the same as universal consumer account access.

**Recommendation:** Treat consumer account integration as a partnership/access opportunity, not an MVP dependency. Assess Amazon Business tracking only if ParcelTime's customer and commercial model qualifies.

### Flipkart
Flipkart's public API platform is oriented toward seller/partner workflows. Do not assume a general consumer order feed is available to third-party apps.

**Recommendation:** Use email discovery and carrier tracking for ordinary consumer orders. Pursue direct integration only through documented partner access and written authorization.

### Delhivery, FedEx, Blue Dart and other carriers
API and webhook availability varies by carrier, geography, account type and contract. Some carriers are available through an aggregator; others require the shipper's carrier account.

**Recommendation:** Verify the target Indian carrier list and account-specific requirements. Add direct APIs where they materially improve coverage, data quality or cost. Do not scrape carrier websites or bypass access controls.

### Shiprocket
Shiprocket is useful for shipments created or managed through its shipping ecosystem where the account authorizes access. It is not a universal gateway to every parcel carried by every courier.

## 14. Security and privacy controls

Shipment data can reveal home addresses, purchases and delivery routines. Treat it as sensitive personal information.

Required controls:
- OAuth with least privilege.
- Encryption in transit and at rest.
- Server-side secret storage and key rotation.
- Never store shopping-site passwords.
- Never expose provider credentials to the frontend.
- Strict tenant and resident authorization.
- Verify webhook signatures and timestamps where supported.
- Rate-limit OAuth callbacks, ingestion and OTP endpoints.
- Redact tokens, email content and tracking numbers from logs.
- Audit shipment access and privileged actions.
- Provide consent withdrawal and data deletion.
- Define retention periods for source data and payloads.
- Validate all external input.
- Protect against SSRF if any integration fetches user-supplied URLs.

Each integration settings page should show provider, data accessed, purpose, connection date, last sync, permission status, disconnect and deletion controls.

Email integration must be optional. Manual tracking and society reception workflows remain available.

## 15. Notification policy

Not every carrier event needs a push notification. Apply rules based on event, resident action, duplicate history, preferences, quiet hours and event completeness.

| Event | Resident | Reception/admin |
|---|---|---|
| Shipment discovered | Optional summary | No |
| Picked up / in transit | Usually digest or no alert | No |
| ETA materially changed | Yes, if useful | No |
| Out for delivery | Yes | Optional operational alert |
| Courier delivered to society | After/with reception confirmation | Yes |
| Parcel registered/stored | Yes | Yes |
| Internal delivery scheduled | Yes | Executive task queue |
| Internal handover complete | Yes | Audit record |
| Exception requiring action | Yes | Yes where operationally relevant |

Use notification idempotency to prevent duplicate alerts.

## 16. Recommended technology stack

Keep ParcelTime's existing direction: Next.js frontend, Node.js/Express backend, PostgreSQL and Prisma. Implement as a modular monolith first.

| Layer | Recommendation | Notes |
|---|---|---|
| Frontend/PWA | Next.js + TypeScript | Resident, guard, executive and admin |
| API | Node.js + Express | Existing backend direction |
| Database | PostgreSQL | Canonical records and event history |
| ORM | Prisma | Schema and transactional writes |
| Validation | Zod | External/internal payload validation |
| Queue | BullMQ + Redis or managed queue | Background work and retries |
| Email | Gmail API + Google OAuth + Pub/Sub | Requires consent and production verification |
| Tracking | AfterShip or evaluated alternative | Check coverage, pricing and account requirements |
| Direct carriers | Provider adapters | Only with authorized access |
| Notifications | FCM/email/SMS provider | Preferences and delivery tracking |
| Observability | Structured logs, metrics, error tracking | Redact personal data |
| Testing | Vitest/Jest + Playwright | Unit, integration and E2E |

Do not introduce Kafka, Kubernetes or multiple microservices at MVP stage without measurable need.

## 17. Implementation roadmap

### Phase 0 — Provider and product validation
- Confirm launch geography and likely courier mix.
- Review aggregator coverage, pricing, rate limits and account requirements.
- Confirm Gmail scope classification and OAuth approval path.
- Complete privacy and consent review.
- Define canonical shipment lifecycle and matching rules.

**Exit:** Integration decision record, provider cost estimate, privacy review and tested sandbox credentials.

### Phase 1 — Manual tracking foundation
- Manual tracking entry.
- Courier selection/detection.
- Tracking provider adapter.
- Shipment timeline.
- Webhook endpoint and signature verification.
- Durable webhook inbox.
- Event deduplication and reconciliation.
- External/internal lifecycle separation.

**Exit:** A test shipment can be registered, updated through webhooks, reconciled and displayed.

### Phase 2 — Automated email discovery
- Gmail OAuth and connection UI.
- Gmail watch + Pub/Sub.
- History cursor sync and watch renewal.
- Deterministic email parsers.
- Constrained extraction fallback.
- Confidence scoring and resident confirmation.
- Deduplication.

**Exit:** Relevant test emails are processed without importing unrelated mailbox content; missed notifications are recovered.

### Phase 3 — Society operations
- Match expected shipments to reception registrations.
- QR/barcode scan or manual lookup.
- Parcel condition and storage location.
- Resident notification on confirmed receipt.
- Internal scheduling and OTP handover.
- Dispute/exception workflow.

**Exit:** Complete chain of custody from external tracking through verified resident handover.

### Phase 4 — Expand coverage
- Additional carrier adapters or aggregator.
- Eligible marketplace/merchant partnerships.
- Direct carrier integrations where commercially justified.
- Provider health and cost dashboards.

**Exit:** Pilot data demonstrates coverage, reliability or cost improvements.

### Phase 5 — Intelligence
- Parcel consolidation.
- Smart slot recommendations.
- Improved AI-assisted extraction.
- ETA quality analysis.
- Delivery capacity recommendations.

**Exit:** Measurable improvements in resident effort, failed handovers or executive productivity.

## 18. Testing and acceptance criteria

### Integration tests
- Gmail watch creation, expiry and renewal.
- Pub/Sub handling and history cursor recovery.
- OAuth revocation and token expiry.
- Tracking registration and courier detection.
- Webhook signature verification.
- Duplicate/out-of-order webhook delivery.
- Provider timeout and rate-limit behavior.
- Retry/dead-letter handling.
- Shipment source linking and deduplication.
- Tenant isolation and resident authorization.

### End-to-end scenarios
1. Resident manually adds a tracking number.
2. Gmail discovers a shipment and links it to an existing record.
3. Two sources discover the same shipment without duplication.
4. Tracking provider reports `OUT_FOR_DELIVERY`.
5. Courier marks parcel delivered to reception.
6. Reception confirms physical receipt and storage.
7. Resident schedules internal delivery.
8. Executive completes OTP handover.
9. Duplicate webhook emits only one notification.
10. Provider outage recovers through retry/reconciliation.
11. Ambiguous resident match requires confirmation.
12. Resident disconnects Gmail and subsequent mailbox processing stops.

### Pilot KPIs
- Share of incoming parcels discovered automatically.
- Share of discovered shipments with valid tracking numbers.
- Correct resident-match rate.
- Duplicate shipment rate.
- Webhook processing latency.
- Tracking freshness.
- Ingestion and reconciliation failure rate.
- Manual correction rate.
- Reception registration time per parcel.
- Time from society receipt to resident notification.
- Failed/disputed handover rate.
- Integration opt-in and disconnect rates.

Do not promise a fixed real-time SLA until provider latency and pilot measurements support it. Show `Last updated`, distinguishing carrier event time from ParcelTime receipt time.

## 19. Key decisions

| Decision | Recommendation | Reason |
|---|---|---|
| Marketplace APIs as MVP dependency | No | Consumer access is not universal |
| Gmail discovery | Yes, subject to approval | Broad merchant coverage for email users |
| Tracking aggregator | Yes | Reduces initial carrier integration effort |
| Direct carrier APIs | Selectively | Coverage, quality or cost improvement |
| Manual tracking | Always | Universal fallback |
| Share-to-ParcelTime | Yes | Useful for SMS, WhatsApp and unsupported sources |
| Webhooks | Primary | Event-driven updates |
| Polling | Reconciliation/fallback | Repairs missed updates |
| Modular monolith | Yes | Lower MVP operational complexity |
| AI extraction | Validated fallback | Flexible parsing without making AI a source of truth |
| Separate external/internal states | Mandatory | Courier delivery is not resident handover |

## 20. Final recommendation

Build in this order:

1. Manual tracking + one aggregator + reliable webhook processing.
2. Gmail discovery with least-privilege OAuth, Pub/Sub, history sync and explicit consent.
3. Society receipt, resident matching, storage and internal handover.
4. Authorized direct marketplace/carrier integrations where access is genuinely available.
5. Parcel consolidation, smart scheduling and AI-assisted extraction.

**Core principle:** ParcelTime should be independent of the shopping platform, but it must never pretend to have access to data that a marketplace or carrier has not authorized it to receive.

Normalize reliable data, show its source and freshness, and maintain a trustworthy chain of custody once the parcel reaches the society.

---

## 21. Official documentation and references

Provider features, API versions, access conditions, pricing and regional coverage can change. Verify them during implementation and before launch.

### Tracking and carriers
- [AfterShip Tracking API — Quick Start](https://www.aftership.com/docs/tracking/quickstart/api-quick-start)
- [AfterShip Tracking — Webhook Overview](https://www.aftership.com/docs/tracking/webhook/webhook-overview)
- [AfterShip — Webhook Specifications and Signature](https://www.aftership.com/docs/tracking/webhook/webhook-specifications)
- [AfterShip — Carrier Account Requirements](https://support.aftership.com/en/tracking/articles/15441457-how-to-connect-carrier-accounts)
- [FedEx — Webhook Developer Guide](https://developer.fedex.com/api/en-us/guides/webhook-developer-guide.html)
- [Shiprocket API Documentation](https://apidocs.shiprocket.in/)

### Gmail and OAuth
- [Gmail API — Configure Push Notifications](https://developers.google.com/workspace/gmail/api/guides/push)
- [Gmail API — Synchronize Clients](https://developers.google.com/workspace/gmail/api/guides/sync)
- [Google OAuth — Restricted Scope Verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification)

### Marketplaces
- [Amazon Selling Partner API — Orders API](https://developer-docs.amazon.com/sp-api/docs/orders-api)
- [Amazon Business — Package Tracking Overview](https://docs.business.amazon.com/docs/package-tracking-overview)
- [Flipkart API Platform Documentation](https://flipkart.github.io/fk-api-platform-docs/docs/intro)

---

## Appendix A — MVP user experience

### Resident dashboard
- Shipment/product label, where available.
- Merchant/source and carrier.
- Expected delivery date.
- External status and last-updated time.
- Source badge (Gmail, manual, shared or partner).
- Confirmation indicator where needed.
- Actions to view timeline, correct details, confirm a match, schedule after society receipt, choose pickup or disconnect an integration.

### Integration settings
- Provider and connection status.
- Permission summary.
- Last successful sync.
- Renewal/sync state.
- Disconnect and deletion controls.
- Troubleshooting information.

### Reception dashboard
- Expected arrivals where reliable data is available.
- Search by tracking number, resident or apartment.
- Scan/register parcel.
- Confirm recipient and apartment.
- Record condition and storage location.
- Notify resident.
- View custody history.

## Appendix B — Definition of done

- [ ] Manual tracking registration works.
- [ ] Tracking provider can be swapped through an adapter.
- [ ] Carrier coverage and account requirements are documented.
- [ ] Webhooks are authenticated and durably ingested.
- [ ] Duplicate and out-of-order events are handled.
- [ ] Reconciliation recovers missed updates.
- [ ] Discovery is separate from tracking.
- [ ] Gmail OAuth and explicit consent work, if enabled.
- [ ] Gmail history sync and watch renewal work.
- [ ] Only relevant, permitted shipment data is retained.
- [ ] Multiple sources link to one physical shipment.
- [ ] Ambiguous resident matches require confirmation.
- [ ] External carrier status is separate from internal custody status.
- [ ] Courier delivery to reception does not complete resident handover.
- [ ] Residents can disconnect integrations and request data deletion.
- [ ] Monitoring, audit logs and operational error handling are in place.

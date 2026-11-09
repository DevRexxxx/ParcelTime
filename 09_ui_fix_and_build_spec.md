# ParcelTime: UI Fix and Build Spec (v2)

Supersedes 08_UI_Improvements. Based on four screenshots of the current build (resident home, scrolled lower cards, AI conversation stream, chat input) and checked against 04_MVP_Screens, 05_User_Flows, 06_System_Design_Rules and 07_Implementation_Plan. No code.

Use this as the working document for both fixing the existing UI and building the target UI.

---

## 1. What the New Screenshots Added

The first screenshot showed an over-loaded resident dashboard. The other three show that it continues as a very long page of about 15 cards, then an AI chat at the bottom. They expose problems that are more serious than styling, including two that break your own security rules.

### 1.1 Critical findings (fix before any pilot)

| # | Finding | Where seen | Why it is critical | Fix |
|---|---|---|---|---|
| C1 | **A stored "memory" says: "Delegate code to Guard Ramesh if unreachable"** | Active Spatial Memory card | Violates the OTP rule that guards and executives never receive the code. It teaches the assistant to hand the delivery check to staff, which defeats the check. | Delete the memory feature for the pilot. If preferences are kept, store only whitelisted settings (preferred slot window, notification choices), never security behavior. Delegation is a named, explicit, auditable action (Flow 13). |
| C2 | **OTP can be requested and shown through chat** | Suggestion chip "What is my handover OTP?", Recent Chats "Request Handover OTP for Blu...", chat share, copy and download icons | The code would live in chat history, exports and shared messages. | The assistant never prints the code. It returns a button that opens the secure code sheet. No code text is ever stored in chat history or export. |
| C3 | **Data contradicts itself** | Unit "A-102" in chat, "Palm Heights Tower B - 402" in memory, society "Greenwood Palms", executive approaching "Tower B", Amazon label named "..._402.pdf" | If a resident sees the wrong unit, they stop trusting every other number. It may also be a cross-unit data leak. | One source of truth for unit and society, loaded from the session. Add a test that every screen shows the same unit and society. Investigate whether the "B-402" value came from another account or from seed data. |
| C4 | **Parcel location conflicts** | Hero card says Out for Delivery (Storage Vault to Your Door), chat lists the same parcel under "Smart Locker Bay 1", other parcel under "Storage Vault - Shelf A", chat text says "reception desk" | One parcel, one status, one location (rule 1.4). Lockers are deferred and do not exist in the MVP. | Show location only from the parcel record. While out for delivery, show the executive, not a shelf. Remove locker references. |
| C5 | **Staff and admin prompts shown to a resident** | Prompt Library: "Check remaining rack vacancy", "Schedule batch evening delivery for Un...", "Generate one-time gate OTP for courier"; Recent Chats: "Gate intake batch query" | Exposes staff capabilities to residents. "Generate one-time gate OTP for courier" implies a code issued to a courier, which is not in the model. | Prompt suggestions come from the user's role and permissions. Remove the courier-OTP idea entirely. |
| C6 | **Assistant can answer "society operations" questions** | Input placeholder: "Ask anything about parcels, scheduling, OTP codes, or society operations..." | A language model with broad data access can leak other units' data or be manipulated by text inside uploaded labels. | The assistant calls the same permissioned API as the app, with the resident's session. It cannot see anything the resident cannot. Treat all uploaded text as untrusted. |

### 1.2 High-priority findings

| # | Finding | Fix |
|---|---|---|
| H1 | **Developer telemetry shown to residents:** AI Model Engine (ParcelAI Spatial 2.4, VisionOS Mode, 128k context), Conversation Stats (42 ms latency, tokens processed, stream engine version) | Remove from resident UI. If needed, move to an admin-only diagnostics page. |
| H2 | **Settings living on the dashboard:** Neon Ambient Glows, Spatial Audio Cues, Desktop Notifications, "Theme: 2030 Pure Black" | Move to Profile, then Settings. Replace decorative toggles with theme (dark, light, auto), notification categories and language. |
| H3 | **Pricing content in the knowledge base:** "Storage Fee Waiver after 7 Days (Pricing)" | Billing is deferred. Remove until the society adopts a fee policy, then show it as an admin-approved policy document. |
| H4 | **Cutoff rule hard-coded in content:** "2-Hour Cutoff Rule for Slot Booking" | The cutoff is a society setting. Render it from configuration so the text cannot go stale. |
| H5 | **Files & Receipts mixes personal documents and society documents** (shipping label, intake proof photo, custody policy) | Split into Parcel documents (inside each parcel, such as the intake photo) and Society documents (policies, bylaws). A shipping label contains an address, so keep it inside the parcel and never in a general file list. |
| H6 | **Internal infrastructure shown as a feature:** "Stored in S3 Private Vault, AES-256" | Replace with a plain reassurance line such as "Private to your household." |
| H7 | **Chat sits at the bottom of a very long page** | Decide what the assistant is for (section 4). It is either a first-class screen or a small launcher, not the last item of a scroll. |
| H8 | **Gradient glow input border and glow-everything style** | Limit glow to one active element per screen. Keep input borders plain with a clear focus ring. |
| H9 | **Chat action icons** (copy, thumbs, share, download, delete) shown on every message | Keep thumbs and copy for plain answers. Remove share and download on anything that touches parcels or codes. |
| H10 | **Orange button with white text** may fall below the 4.5:1 text contrast needed for AA | Use dark text on the bright orange, or a deeper orange with white text. Verify with a checker. |

### 1.3 Findings carried over from v1
Role leakage in navigation, wrong KPIs for residents, duplicate OTP surfaces, jargon (Bento, Spatial, Vault, Instruction), low-contrast tiny text, and out-of-scope features presented as live (lockers, courier gateways, model switcher). All remain valid and are folded into the specs below.

---

## 2. Disposition of Every Card Seen

| Card or element | Decision | Destination or reason |
|---|---|---|
| Top bar: society chip | Keep | Show society and unit |
| Top bar: model selector "ParcelTime Vision-3" | Remove | Not a resident concern |
| Top bar: search | Keep for staff and admin. Residents get a filter on Parcels | Simpler for residents |
| Top bar: mic | Defer | Voice is post-pilot |
| Top bar: bell | Keep | Opens Inbox, numeric badge |
| Top bar: role dropdown | Keep only if the user holds more than one role | Role switcher |
| Sidebar: New Instruction | Replace | "Schedule delivery" for residents, "Receive parcel" for guards |
| Sidebar: AI Concierge | Move | Assistant entry, flagged, see section 4 |
| Sidebar: Operations Bento | Rename and restrict | Admin "Overview" |
| Sidebar: Resident Portal | Rename | Resident "Home" |
| Sidebar: Reception Desk, Executive Console, Society Admin | Restrict | Visible only to those roles |
| Sidebar: Recent Tasks | Replace | Recent activity from real events |
| KPI: In Storage Vault | Rename | "Waiting at the gate" (personal count) |
| KPI: Scheduled Slots | Keep, personalize | "Scheduled" (personal count) |
| KPI: Out For Delivery | Keep, personalize | "On its way" |
| KPI: Delivery Success 99.4% | Remove from resident | Admin Overview only |
| Tabs: All Bento Cards, Delivery & Storage, AI Models & Workspace | Remove | Replaced by real navigation |
| Card: Out For Delivery | Keep, refine | Hero card |
| Card: Handover Code | Merge | Full-screen delivery code sheet |
| Card: Spatial Voice Assistant | Defer | Post-pilot |
| Card: Society Storage Vault | Move | Admin and guard only |
| Card: Instant Operations | Replace | Role-specific quick actions |
| Card: Active Workspace | Rename and trim | "Your society": name, units, contact, gate status |
| Card: AI Model Engine | Remove | Developer telemetry |
| Card: Conversation Stats | Remove | Developer telemetry |
| Card: Active Spatial Memory | Remove for pilot | Security risk (C1) |
| Card: Recent Chats | Defer with assistant | Part of the assistant screen |
| Card: Files & Receipts | Split | Parcel documents inside the parcel, society documents under Help |
| Card: Society Knowledge Base | Rename and move | "Society rules" under Help, rendered from configuration |
| Card: Prompt Library | Remove | Replaced by role-aware suggestion chips |
| Card: Spatial Interface Settings | Move | Profile, then Settings, with real options |
| AI Conversation Stream | Defer or constrain | Assistant screen (section 4) |
| Footer: "Connected to 4 courier gateways" | Remove | Courier APIs are deferred |
| Footer: user chip (Priya Sharma, Unit A-102, Owner) | Keep | Move to Profile menu |

---

## 3. Target Information Architecture

### 3.1 Resident
Bottom bar on mobile, left rail on desktop:
1. **Home** (hero delivery, waiting, scheduled, recent)
2. **Parcels** (all, filter by status, history)
3. **Schedule** (slots and bookings)
4. **Inbox** (notifications and updates)
5. **Me** (household, profile, settings, society rules, help)

The Assistant, if enabled, appears as a floating button on Home and Parcels, not as a nav item.

### 3.2 Other roles (summary)
| Role | Bottom bar |
|---|---|
| Guard | Receive, Pickups, Pending sync, Me |
| Executive | Today, Scan, History, Me |
| Admin | Overview, Parcels, Planning, Society (units, staff, slots), Me |
| Platform admin | Societies, Health, Me |

Only the entries a person's role allows are rendered. They are not disabled or greyed.

---

## 4. The AI Assistant: Decision and Rules

The assistant is not in the MVP scope documents, but it exists in the build. Two options:

| Option | Meaning | Recommendation |
|---|---|---|
| A. Remove for the pilot | Fewer risks, smaller surface | Safest |
| B. Keep as a constrained helper behind a feature flag | Residents can ask in plain language and tap through to real actions | Acceptable if all rules below hold |

If Option B, these rules are mandatory:

1. **Same permissions as the user.** The assistant calls the same API with the resident's session. It can never read more than the resident can.
2. **Actions by buttons, not by free text.** The assistant proposes an action card (Schedule, Show code, Self-pickup). The user confirms in the normal flow. It never changes a parcel by itself.
3. **Never prints sensitive data.** Delivery codes, full addresses and phone numbers are not written into chat. "Show my code" opens the code sheet.
4. **Scoped to the household's parcels and society rules.** Questions about staff operations, other units or storage capacity get a polite refusal with the relevant contact.
5. **Untrusted inputs.** Text read from labels, filenames or photos is data, never instructions.
6. **Transparent.** Label as an assistant. Show what it used ("Based on your parcels and society rules"). Offer "Report a wrong answer" on every reply.
7. **Graceful failure.** When unsure or unavailable, say so and offer the normal screen.
8. **No persistent behavioral memory in the pilot.** If memory returns later, store only user-visible, editable preferences from a fixed list.
9. **History is private and deletable.** No share or export on parcel-related replies. Retention follows the privacy rules.
10. **Never the only path.** Everything the assistant can do exists as a normal button flow.

Chat suggestions are generated from the user's role and current parcel state, for example "Schedule my Amazon delivery" only when such a parcel is waiting.

---

## 5. Resident Screen Specs (Build This)

Each spec lists purpose, content, actions, states, and acceptance criteria.

### 5.1 Home

**Purpose:** Answer "What is happening with my parcels and what should I do next?" in five seconds.

**Content (in order)**
1. Greeting and one-line summary ("1 on its way, 1 waiting for you").
2. Hero card: the most urgent item (out for delivery, then code needed, then waiting parcel).
3. Waiting for you (list).
4. Scheduled (list).
5. Recent (last 3 delivered).

**Actions:** Show my delivery code, Schedule delivery, Self-pickup, Reschedule, Open parcel.

**States:** empty (nothing today), loading skeleton, offline banner with "last updated", error with Retry.

**Acceptance**
- No metric or card that is not about this household.
- One primary button visible without scrolling on a 360 px wide phone.
- Same unit and society names everywhere.

### 5.2 Hero delivery card

- Title: "Your parcel is on its way".
- Courier name, parcel code, executive first name and initials or photo, ETA in words and minutes.
- Three-step track with text labels and a current-step marker (Collected from storage, On its way, At your door).
- Primary action: Show my delivery code. Secondary: Call reception.
- Live update without page reload. If updates stop for more than a set time, show "Updated 3 min ago" and a refresh.

**Acceptance:** current step is understandable without color; screen reader reads "Step 2 of 3, on its way".

### 5.3 Delivery code sheet

- Opens full screen from the hero card or from the parcel.
- Hidden by default. Reveal shows large digits (at least 40 px) with spacing.
- Auto-hides after 30 seconds or when leaving the screen. Blocks screenshots where the platform allows.
- Countdown as text and a thin bar. Expiry default 10 minutes, configurable (current build shows 12 minutes; align with the society setting).
- Actions: Generate new code (rate limited; old one stops working), Close.
- No copy, share or forward actions.
- Safety line: "Only tell this code to the person at your door."
- When the code is bound to several parcels for the same stop, show the count: "Works for 2 parcels from this delivery."
- Success: after verification, show "Delivered" with time and who received.
- Expired and locked states with a single next step each.

**Acceptance:** code text never appears in logs, chat, notifications, or screenshots of the inbox.

### 5.4 Waiting parcel card and Parcel detail

- Photo thumbnail, courier, parcel code, arrival time, storage location (plain: "Gate rack A").
- Two equal actions: Schedule delivery, I'll pick it up.
- Detail page: full timeline (received, scheduled, assigned, out for delivery, delivered), documents for this parcel (intake photo), who can see it (household members), delegate option.
- Aging cue: "Please collect by Fri 14 Nov" using the society's days limit.

### 5.5 Schedule

- Day chips and slots with plain availability (Available, Few left, Full).
- Disabled reasons: "Booking closed for this slot", "Full".
- Confirm button states the choice: "Book Tue, 7 to 9 PM".
- Note field optional.
- Conflict handling: "That slot was just taken" with refreshed list, note preserved.
- Multi-parcel: choose several waiting parcels for one slot.

### 5.6 Inbox

- Grouped by parcel, newest first, unread marker.
- Each item has its action inline (Schedule, Show code).
- Critical items cannot be muted.
- Empty state explains what will appear.

### 5.7 Parcels
- Tabs: Active, Scheduled, History.
- Search by courier, code or tracking number.
- Each row shows one status label only.

### 5.8 Me
- Household members and relationships (read-only for non-owners).
- Notification categories and permission status.
- Appearance: theme (dark, light, auto), language.
- Delegates (named, time-limited, auditable).
- Society rules and contacts (rendered from configuration).
- Privacy: consent record, export, delete request.
- Sign out and active sessions.

### 5.9 Assistant (only if Option B)
- Opens as a sheet from a floating button.
- Greeting, role-aware suggestion chips, answer cards with action buttons.
- Disclaimer line and "Report a wrong answer".
- Clear chat, no share or export.

---

## 6. Staff and Admin Screens That Must Exist (Short Spec)

| Screen | Must contain | Must not contain |
|---|---|---|
| Guard: Receive | Scan first, courier chip, unit typeahead, photo, location, Register, last 5 scans, pending sync count | Resident booking details, analytics |
| Guard: Pickups | Search by parcel or unit, QR scan, self-pickup handover, misplacement flag | Delivery code values |
| Executive: Today | Task list by slot, tower, floor, collect scan, OTP entry field, failed attempt with reasons | Other society data, code values |
| Admin: Overview | Today's counts, exceptions list, slot capacity versus staff, aging parcels, storage occupancy, delivery success rate | Resident-only actions |
| Admin: Planning | Slot grid, assign or reassign, reduce or close slots with affected bookings | Free-form AI prompts |

The storage vault occupancy bars and the delivery success metric belong here.

---

## 7. Design Tokens

All values are starting points. Verify contrast with a checker before freezing.

### 7.1 Color (dark theme)
| Token | Value | Use |
|---|---|---|
| bg | #0E0E10 | App background |
| surface | #17171A | Cards |
| surface-raised | #1F1F24 | Sheets, menus |
| border | #2E2E35 | Dividers |
| text-primary | #F5F5F7 | Headings, key values |
| text-secondary | #B4B4BE | Supporting text |
| text-muted | #8E8E99 | Large or non-essential only, verify |
| brand | #FF6A1A | Primary actions, active nav |
| on-brand | #1A0E05 | Text on brand buttons |
| success | #3DDC97 | Delivered, confirmed |
| warning | #FFB020 | Few left, aging, expiring |
| danger | #FF5C5C | Failed, expired, locked |
| info | #6AA9FF | Neutral status |

### 7.2 Color (light theme)
| Token | Value |
|---|---|
| bg | #FAFAF8 |
| surface | #FFFFFF |
| border | #E2E2E6 |
| text-primary | #1A1A1F |
| text-secondary | #4A4A55 |
| brand | #C2410C with white text |
| success | #15803D |
| warning | #B45309 |
| danger | #B91C1C |

### 7.3 Typography
- UI font: one sans-serif family. Monospace only for parcel codes, tracking numbers and the delivery code.
- Page title 24 to 28, card title 18, body 15 to 16, supporting 13 to 14, minimum 12.
- Sentence case. No tiny wide-spaced all-caps labels.

### 7.4 Spacing, shape, motion
- 8 px grid. Card padding 16 mobile, 24 desktop.
- Two radius sizes only (cards, controls) plus full-round for chips.
- Glow and gradient reserved for the single active hero element.
- Motion under 250 ms, purposeful (step pulse, sheet slide, success check). Respect reduced motion.

### 7.5 Status vocabulary (one label everywhere)
| Status | Resident-facing label |
|---|---|
| RECEIVED | Waiting at the gate |
| SCHEDULED | Scheduled |
| ASSIGNED | Scheduled (staff assigned) |
| OUT_FOR_DELIVERY | On its way |
| DELIVERED | Delivered |
| CANCELLED | Cancelled |
| UNCLAIMED | Please collect |
| RETURNED_TO_COURIER | Returned to courier |

---

## 8. Component Inventory

| Component | Notes |
|---|---|
| AppShell | Role-aware nav, bottom bar on mobile, rail on desktop, offline banner slot |
| SocietyChip | Society name and unit, always from session |
| RoleSwitcher | Rendered only for multi-role users |
| HeroDeliveryCard | Section 5.2 |
| DeliveryTrack | Three labelled steps, text and icon status |
| CodeSheet | Section 5.3, includes locked, expired, success states |
| ParcelCard | Waiting, scheduled and history variants |
| ParcelTimeline | From audit-backed events |
| SlotPicker | Day chips, slot list, availability words, disabled reasons |
| StatusBadge | One label per status, icon plus text |
| ActionBar | Primary and secondary buttons, sticky on mobile |
| InboxItem | With inline action |
| EmptyState, ErrorState, Skeleton, OfflineBanner | Shared patterns |
| ConfirmDialog | States the consequence |
| ScanInput | Camera barcode and QR, manual fallback (guards, executives) |
| SyncQueueList | Pending, failed, conflict items (guards) |
| AssistantSheet | Only if enabled |

---

## 9. Copy Deck (Replace Existing Text)

| Current | New |
|---|---|
| Spatial Operations Dashboard | Home |
| New Instruction | Schedule delivery |
| In Storage Vault | Waiting at the gate |
| Delivery Success 99.4% | (removed from resident, "Delivery success rate" in Admin) |
| Handover Code | Delivery code |
| View Handover OTP | Show my delivery code |
| OTP Enforced | Code required at handover |
| Active Workspace | Your society |
| Instant Operations | Quick actions |
| Society Knowledge Base | Society rules |
| Files & Receipts | Parcel documents (inside each parcel) |
| Spatial Interface Settings | Settings |
| Recent Tasks | Recent activity |
| Executive: Rajesh Kumar, Approaching Tower B | Rajesh K. is about 5 minutes away |
| Stored in S3 Private Vault, AES-256 | Private to your household |
| Ask anything about parcels, scheduling, OTP codes, or society operations... | Ask about your parcels or bookings |

Voice: short, calm, active. Say what happened and what the person can do next.

---

## 10. Data the UI Needs (Contracts in Plain Words)

| Screen | Required fields | Rule |
|---|---|---|
| Header | Society name, unit label, user name | From session only |
| Parcel card | Parcel id, courier, status, arrival time, storage location, photo link, current slot if any | One status and one location from the parcel record |
| Hero card | Parcel, executive first name and photo, ETA, track step | ETA may be absent, show "On its way" |
| Code sheet | Challenge id, expiry time, attempts remaining, count of parcels covered | The digits are returned only on explicit reveal and never logged |
| Slot picker | Slot instances with date, window, remaining capacity band, closed reason | Capacity bands, not exact numbers |
| Inbox | Notification id, parcel id, type, time, read state, inline action | No codes or full addresses |
| Society rules | Cutoff hours, booking window, unclaimed days, reschedule limit | Rendered from configuration |

---

## 11. Fix and Build Plan

### 11.1 Stage 1: Stop the bleeding (about 3 to 4 days)
1. Remove memory, model engine, conversation stats, prompt library, settings-on-dashboard, courier gateway text.
2. Disable the OTP-in-chat path and delete OTP-related suggestion chips. Remove copy and share on code and parcel replies.
3. Restrict navigation and cards by role.
4. Fix data consistency (unit, society, parcel location) and add a cross-screen test.
5. Hide lockers, pricing and voice behind feature flags set to off.

### 11.2 Stage 2: Rebuild the resident core (about 1.5 weeks)
1. AppShell with role-aware navigation and mobile bottom bar.
2. Home with hero card, waiting and scheduled lists.
3. Code sheet with all states.
4. Parcel detail, Schedule, Inbox, Parcels, Me.
5. Empty, loading, error and offline states.
6. Copy deck applied.

### 11.3 Stage 3: Visual system and accessibility (about 1 week)
1. Tokens, type scale, light theme and auto mode.
2. Contrast and target-size pass, focus rings, screen reader labels.
3. Reduced-motion support, glow limited to the hero element.
4. Low-end Android performance pass.

### 11.4 Stage 4: Staff and admin surfaces (about 1.5 weeks)
Guard Receive, Pickups, Executive Today, Admin Overview and Planning per section 6, using the same components.

### 11.5 Stage 5: Assistant (optional, after the pilot gate or flagged)
Implement section 4 rules with tests before enabling for any resident.

### 11.6 Frontend structure (suggested)
```
apps/web/src/
  app/            routing, role guards, providers
  features/
    resident/     home, parcels, schedule, inbox, me
    guard/        receive, pickups, sync
    executive/    today, scan
    admin/        overview, planning, society
    assistant/    (flagged)
  components/     shared UI (section 8)
  lib/            api client, offline queue, formatting
  styles/         tokens, themes
packages/shared/  schemas, status labels, permissions
```
The status labels and permission matrix live in the shared package so the UI cannot drift from the API.

### 11.7 Testing
| Layer | What |
|---|---|
| Component | Every state of HeroDeliveryCard, CodeSheet, SlotPicker, StatusBadge |
| Role visibility | For each role, assert which routes and cards are present and that others are absent |
| Consistency | Same society, unit and parcel status across Home, Parcel detail, Inbox |
| Security | Code digits not present in DOM until Reveal, not in network logs or storage, auto-hide works, no copy or share control |
| Accessibility | Automated checks in CI plus manual screen reader and keyboard pass |
| End to end | Resident: see parcel, schedule, reschedule, receive delivery with code. Failure paths: slot just filled, code expired, code locked |
| Visual regression | Dark and light, mobile and desktop |
| Device | Mid-range Android, small screen, throttled network |

### 11.8 Definition of done (each screen)
1. Matches this spec and the flows in 05.
2. Uses shared components and tokens.
3. Handles empty, loading, error and offline.
4. Passes role visibility, consistency and accessibility tests.
5. Reviewed on a real phone in daylight.

---

## 12. References

These are real products and standards to study. The product descriptions below come from public pages and help articles, so do a hands-on pass of each app before copying any pattern.

### 12.1 Market references (gated community and parcel apps)

| Reference | What to borrow | What to avoid or adapt |
|---|---|---|
| **MyGate: Leave at Gate** | Guard marks a delivery, resident gets a notification with Approve, Deny or Leave at Gate. After the guard collects the parcel, the resident gets a 6-digit pickup code to share when collecting. Separate interfaces for residents, guards and committee, and a modular approach where residents see only what their society enables. | Its model hands pickup responsibility to a guard. ParcelTime adds scheduled delivery and per-parcel custody and audit on top. Do not copy its breadth of unrelated features. |
| **NoBrokerHood: Parcel Management** | A "My Packages" list under gate updates, an OTP per delivery that the resident shares when collecting, and one OTP that remains valid for the remaining parcels of the same delivery. Guard app that logs entries in seconds and works offline. Pre-approval options such as Delivery and Collect at Gate. | Many modules compete on the home screen in general-purpose society apps. Keep ParcelTime focused on parcels. |
| **Amazon Hub Locker and Counter** | Six-digit pickup code, an explicit pickup deadline stated in the notification (typically a few days), forwarding the details to a trusted person, and a barcode alternative. Good model for aging and "collect by" messaging. | Lockers are deferred for ParcelTime. Borrow the code and deadline pattern only. |
| **Uber PIN verification** | Code appears in the app only when the driver is on the way. Rider can tap to show a magnified PIN, the driver enters it, and the rider gets a confirmation that it matched. The trip cannot start until the correct PIN is entered. | Opt-in and night-only options do not apply. For ParcelTime, the code check is always required for doorstep delivery. |

Sources:
- MyGate help: [Leave at Gate](https://help.mygate.in/articles/133767-what-is-the-leave-at-gate-module-and-how-does-it-work-in-mygate)
- MyGate: [Leave at Gate overview](https://mygate.in/blog/leave-at-gate/) and [residents](https://mygate.in/community-management/residents/)
- NoBrokerHood: [Advanced Parcel Management](https://www.nobrokerhood.com/blog/nobrokerhood-exclusive-introducing-advanced-parcel-management-for-your-society/), [Gatekeeper app](https://www.nobrokerhood.com/solutions/gatekeeper-app), [Notify Gate](https://www.nobrokerhood.com/blog/make-your-visitors-entry-hassle-free-with-nobrokerhoods-notify-gate/)
- Amazon Hub Locker explainers: [Yahoo Tech guide](https://tech.yahoo.com/apps/articles/set-amazon-hub-locker-pick-191510136.html), [Circuit](https://package-tracker.getcircuit.com/blog/how-do-amazon-lockers-work)
- Uber: [PIN verification (Uber Newsroom)](https://www.uber.com/au/en/newsroom/pinanz/)

### 12.2 AI interface references

| Reference | What to borrow |
|---|---|
| **Google People + AI Research (PAIR) Guidebook** | Chapters on explainability and trust, feedback and control, and errors and graceful failure. Use them for the assistant rules in section 4: calibrated trust, user control, and clear recovery when the assistant is wrong. |
| **Microsoft HAX Design Library (human-AI interaction guidelines)** | Guideline-based patterns with examples, useful for setting expectations, showing what the assistant used, and allowing correction. |

Sources: [PAIR Guidebook](https://pair.withgoogle.com/guidebook), [PAIR chapters overview](https://www.exploreaiethics.com/tools/people-ai-guidebook/)

### 12.3 Accessibility reference

| Standard | Practical rule for this build |
|---|---|
| **WCAG 2.2 AA, contrast** | Normal text at least 4.5:1, large text and UI components at least 3:1. |
| **WCAG 2.2 AA, target size** | Interactive targets at least 24 by 24 CSS pixels. ParcelTime aims higher (48 px on mobile) because guards and executives use phones one-handed outdoors. |
| **WCAG 2.2 AA, other** | Visible focus, resizable text up to 200 percent, no meaning by color alone. |

Sources: [WCAG 2.2 AA guide](https://getwcag.com/blog/wcag-2-2-checklist), [Target Size Minimum](https://kb.daisy.org/publishing/docs/conformance/wcag/target-size-minimum.html)

### 12.4 Visual and interaction inspiration to review hands-on (not fetched)
Delivery-tracking screens in food and quick-commerce apps (progress track, ETA in words), wallet-style cards for single high-importance items, and system design languages for Android (Material) and iOS (Human Interface Guidelines). Review them directly for spacing, bottom navigation and sheet behavior.

---

## 13. Before and After Summary

| Before | After |
|---|---|
| One long page of about 15 cards for every role | Short role-specific home plus real navigation |
| Chat at the bottom, can print the OTP | Optional constrained assistant, code only in the secure sheet |
| Memory suggests giving the code to a guard | No behavioral memory, delegation is an explicit audited action |
| Model telemetry, token counts, engine versions | Removed from residents |
| Staff prompts and vault data in resident view | Visible only to staff and admin |
| Unit and parcel location inconsistent | One source of truth, tested across screens |
| Lockers, courier gateways, pricing on screen | Hidden until the pilot gate |
| Settings as decorative toggles on the dashboard | Real settings under Me |
| Tiny dim text, many glows, white text on orange | Readable tokens, glow on one element, verified contrast |

---

## 14. Acceptance Checklist for the UI Fix

- [ ] No resident screen shows any staff or admin data or controls.
- [ ] Society and unit match on every screen for a given account.
- [ ] A parcel never shows two statuses or two locations.
- [ ] Delivery code digits appear only after Reveal and never in chat, notifications, logs or exports.
- [ ] No control exists to copy, share or forward the delivery code.
- [ ] No assistant suggestion or memory item involves giving the code to staff.
- [ ] No developer telemetry visible to residents.
- [ ] No lockers, courier gateways, pricing or voice features visible without a flag.
- [ ] Contrast and target sizes pass the checks in section 12.3.
- [ ] Empty, loading, error, offline, expired and locked states all exist.
- [ ] Home usable one-handed on a 360 px wide phone in daylight.

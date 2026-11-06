# ParcelTime — MVP Screen Specification

| | |
|---|---|
| **Version** | 1.0 (MVP) |
| **Related docs** | 01_PRD, 05_User_Flows |

This document lists every screen in the MVP: its purpose, who uses it, what it shows, the actions available, and the states it must handle. It describes behaviour, not visual design.

---

## 1. Design Principles

1. **Mobile first.** Resident, reception and executive experiences are designed for a phone held in one hand. Admin is responsive but desktop-friendly.
2. **One primary action per screen.** The next step is always obvious.
3. **Speed at reception.** Fewest taps and no typing where scanning or selection can replace it.
4. **Clarity of status.** Every parcel shows a plain-language status with a colour and an icon, never colour alone.
5. **Safe by default.** Destructive or custody-changing actions ask for confirmation and show what will happen.
6. **Resilient.** Every screen defines loading, empty, error and offline behaviour.
7. **Accessible.** Large touch targets, high contrast, labels for assistive technology, readable at small sizes.
8. **Language-ready.** All text comes from a translation catalogue; English first, Hindi later.

## 2. Roles and Navigation Overview

| Role | Navigation (bottom bar on mobile) |
|---|---|
| Resident | Home, Parcels, Alerts, Profile |
| Reception | Today, Register, Find, Storage, Profile |
| Delivery Executive | Tasks, Scan, Alerts, Profile |
| Society Admin | Dashboard, Parcels, People, Setup, Reports (side menu on desktop) |

A user with several roles sees a role switcher in the profile menu and at the top of the screen.

## 3. Standard Screen States (apply to all screens)

| State | Behaviour |
|---|---|
| Loading | Skeleton placeholders matching the layout. |
| Empty | A short explanation and the next action (for example, "No parcels yet. We will notify you when one arrives."). |
| Error | Plain message, retry action, and a request reference for support. |
| Offline | Banner at the top; read-only cached data where available; reception shows the pending-sync queue. |
| No permission | A clear message and a path back; no technical details. |
| Session expired | Return to sign-in and then back to the same screen. |

## 4. Shared Screens

### SC-01 Sign In
- **Users:** all.
- **Elements:** identifier (email or phone), password, sign-in button, forgot password link, link to accept an invite.
- **States:** wrong credentials (generic message), locked after repeated failures with wait time, offline.
- **Next:** role home; if several societies, society selection first.

### SC-02 Accept Invite
- **Users:** invited people.
- **Elements:** invite details (society, role, unit), name, password setup, consent to terms and privacy notice, notification permission prompt after success.
- **States:** expired or revoked invite with a way to request a new one.

### SC-03 Join Request (resident without invite)
- **Elements:** society code or selection, tower and unit selector, relation to the unit (owner, tenant, family), submit.
- **Result:** "Pending approval" screen; push when decided.

### SC-04 Forgot and Reset Password
- **Elements:** request step (identifier), verification, new password with strength guidance, success message.

### SC-05 Society Selector
- **Shown when:** a user belongs to more than one society.
- **Elements:** list of societies and roles; remembers the last choice.

### SC-06 Notifications List
- **Elements:** grouped by day, unread indicator, tap to open the related parcel, mark all as read.
- **States:** empty, push permission prompt if disabled.

### SC-07 Profile and Settings
- **Elements:** name, contact details, notification preferences by category, linked units (resident), active society, role switcher, language, sign out, privacy and terms links.
- **Actions:** manage devices registered for push, request data export or deletion (starts a support request in the MVP).

## 5. Resident Screens

### SC-R1 Home
- **Purpose:** show what needs attention now.
- **Elements:** greeting, counters (waiting for scheduling, scheduled, out for delivery), an "Action needed" list of parcels to schedule, the next upcoming delivery card, recent history.
- **Primary action:** "Schedule" on a parcel needing action.
- **States:** no parcels, parcels but none needing action, delivery in progress banner.

### SC-R2 Parcel List
- **Elements:** tabs for Active and History; search; each card shows courier, received date, status, storage note, and a scheduled window if present.
- **Filters:** status, date range.
- **Visibility:** only parcels of the resident's active unit memberships; a unit switcher if the resident belongs to more than one.

### SC-R3 Parcel Detail
- **Elements:** status with plain-language explanation, courier and tracking number, received time, parcel photo (when allowed), status timeline, schedule details, actions.
- **Actions by status:**
  - In Storage: Schedule delivery, Request self-pickup.
  - Scheduled: Reschedule, Cancel schedule (until cutoff).
  - Assigned or Out for Delivery: Show handover code (when out for delivery).
  - Delivery Failed: Reschedule.
  - Unclaimed: Reactivate.
  - Delivered or Picked Up: view proof and receipt details.
- **States:** photo unavailable, action no longer allowed (cutoff passed) with explanation.

### SC-R4 Schedule Delivery
- **Elements:** date picker limited to the scheduling horizon, slot list for the chosen date showing label, time window and availability (open, few left, full), optional delivery note for the executive, confirm button.
- **Rules shown:** cutoff time and what happens if unavailable.
- **States:** no slots available (suggest another date or self-pickup), slot just filled (refresh and message), cutoff passed.
- **Confirmation:** summary then success screen with the window and an "Add to calendar" option.

### SC-R5 Reschedule or Cancel
- **Elements:** current schedule, new date and slot choices (same as SC-R4), reason (optional), confirm.
- **States:** cutoff passed, with a message to contact the admin.

### SC-R6 Handover Code
- **Purpose:** let the resident prove receipt.
- **Elements:** large six-digit code, countdown to expiry, parcel summary, delivery executive name, regenerate button (limited), reminder to share the code only at the door.
- **States:** expired code, locked after wrong attempts with a regenerate option, parcel not yet out for delivery (explanation).

### SC-R7 Self-Pickup Request
- **Elements:** parcel summary, preferred time (optional), what to bring, submit.
- **Result:** reception is notified; request can be cancelled from the parcel detail.

### SC-R8 Delivery History
- **Elements:** completed deliveries and pickups with dates and receipt details; search and filter.

## 6. Reception Screens

### SC-S1 Today
- **Purpose:** the desk's working view.
- **Elements:** counters (received today, awaiting scheduling, scheduled today, pickup requests, unclaimed warnings), pickup requests list, today's scheduled releases by slot, quick search box, prominent Register button.
- **Primary action:** Register parcel.

### SC-S2 Register Parcel
- **Purpose:** record an arriving parcel in under 30 seconds.
- **Steps on one screen:**
  1. Scan the courier label barcode (manual entry fallback); courier is suggested from the pattern or chosen from a list.
  2. Select the unit with typeahead by tower and number; show resident names (initials where privacy requires) to confirm.
  3. Optional recipient name.
  4. Take a photo (required or optional per society setting).
  5. Choose the storage location (defaults to the last used).
  6. Save.
- **After save:** success with Parcel ID and QR label (show on screen or print), buttons for "Register another" and "View parcel".
- **States:** duplicate tracking number warning with a link to the existing parcel, unit not found, offline (saved to queue with a visible badge), camera permission denied (instructions), photo upload failed (parcel saved, retry upload).

### SC-S3 Find Parcel
- **Elements:** search by Parcel ID, tracking number or unit; scan QR; filters by status and date; result list.
- **Actions:** open detail.

### SC-S4 Parcel Detail (Staff)
- **Elements:** all parcel data, photos, storage location, status and full timeline, schedule and task details.
- **Actions by status:** move storage, assign executive, unassign, release for pickup, return to courier (reason required), view audit.

### SC-S5 Pickup Verification
- **Elements:** parcel and resident summary, verification method (resident OTP or identity check), confirm handover, optional photo, cancel.
- **States:** OTP wrong or expired, attempts exhausted, request cancelled by the resident.

### SC-S6 Storage Overview
- **Elements:** locations with occupancy bars, parcels listed per location, ageing indicators.
- **Actions:** move parcels between locations.

### SC-S7 Assign Tasks (when allowed by settings)
- **Elements:** unassigned tasks by slot and tower, executive list with current load, assign and unassign actions.

## 7. Delivery Executive Screens

### SC-D1 Task List
- **Elements:** today's tasks grouped by slot window then tower; each card shows unit, parcel count for the unit, window, and status; pool tasks shown separately with a Claim action when pool mode is on.
- **Primary action:** start the next task.
- **States:** no tasks, tasks outside window (shown but dimmed with time), overdue indicators.

### SC-D2 Task Detail
- **Elements:** unit and tower, resident first name or initials, delivery note, parcel list with IDs, window, instructions, status.
- **Actions:** Scan parcel to start, Report problem.
- **Privacy:** executives see only what is needed for delivery.

### SC-D3 Scan Parcel
- **Elements:** camera view, manual code entry fallback, result confirmation showing parcel ID and unit.
- **States:** wrong parcel for this task (blocking message), not assigned to you, camera denied.
- **Result:** parcel moves to Out for Delivery; resident is notified.

### SC-D4 Verify Handover
- **Elements:** parcel summary, six-digit code entry, verify button, attempts remaining.
- **Success:** confirmation screen and return to the task list.
- **States:** wrong code, expired, locked (resident must regenerate), network error (do not allow duplicate submission, show safe retry).
- **Alternative:** "Resident cannot provide code" leads to SC-D5.

### SC-D5 Override Handover
- **Elements:** coded reason (resident unreachable, code not received, authorized family member), required proof photo, name of the person who received, confirm.
- **Notice:** the action is flagged for admin review.

### SC-D6 Failed Attempt
- **Elements:** coded reason (not at home, refused, wrong address, other with note), optional photo, confirm and return parcel to storage.
- **Result:** resident is notified to reschedule.

## 8. Society Admin Screens

### SC-A1 Dashboard
- **Elements:** metrics for received today, awaiting scheduling, scheduled, out for delivery, delivered, failed or delayed, storage occupancy, on-time rate, average handling time; alerts panel (ageing parcels, overrides awaiting review, overdue tasks, pending join requests); date range filter.

### SC-A2 Parcel Inventory
- **Elements:** table with filters (status, tower, courier, age, date), search, export.
- **Actions:** open parcel detail with audit timeline.

### SC-A3 Parcel Audit View
- **Elements:** chronological events with actor, role, time, previous and new status, and context; flagged events highlighted.
- **Actions:** approve or comment on flagged overrides.

### SC-A4 Units and Towers
- **Elements:** tower list, unit table, add and edit, deactivate.
- **Import:** upload file, validation report with row-level errors, confirm import.

### SC-A5 Residents and Members
- **Elements:** member table by role and status, unit linkage, suspend and reactivate, change roles.

### SC-A6 Invites and Join Requests
- **Elements:** invite creation (contact, role, unit), invite list with status and resend or revoke; pending join requests with approve and reject.

### SC-A7 Staff Management
- **Elements:** reception staff and executives, status, shift notes, assign roles.

### SC-A8 Slot Configuration
- **Elements:** templates (label, time window, capacity, active days); date-specific overrides (block a date, reduce capacity); preview of upcoming slot instances with bookings.
- **Rules shown:** changing a template that has bookings requires confirmation and notifies affected residents.

### SC-A9 Storage Locations
- **Elements:** list with capacity and occupancy, add, edit, deactivate.

### SC-A10 Society Settings
- **Elements:** profile, timezone, scheduling horizon, booking cutoff, unclaimed threshold, photo-required toggle, assignment mode, OTP expiry, failed-attempt limit, notification defaults.

### SC-A11 Reports
- **Elements:** performance and volume reports by date range, tower, courier; on-time and failure analysis; staff workload; CSV export.

### SC-A12 Unclaimed and Exceptions
- **Elements:** list of unclaimed parcels, parcels with repeated failures, flagged overrides.
- **Actions:** contact resident, reactivate, return to courier with reason.

## 9. Platform Admin Screens (internal)

### SC-P1 Society List and Create
- **Elements:** societies with status, create society, create first admin invite.

### SC-P2 Support Access
- **Elements:** request time-limited access to a society for support; all access is audited and shown to the society admin.

## 10. Notification Content (summary)

| Event | Recipient | Message intent |
|---|---|---|
| Parcel received | Unit members | A parcel from the courier has arrived; schedule delivery. |
| Schedule confirmed | Resident | Delivery set for date and window. |
| Schedule changed or slot blocked | Resident | Action needed to reschedule. |
| Reminder | Resident and executive | Delivery window starts soon. |
| Task assigned | Executive | New task with window. |
| Out for delivery | Resident | Executive is on the way; open handover code. |
| Delivered | Resident | Delivery completed. |
| Delivery failed | Resident | Reason and reschedule prompt. |
| Pickup ready or requested | Resident or reception | Next step for pickup. |
| Unclaimed warning | Resident | Parcel will be returned after a date. |
| Join decision | Resident | Approved or rejected. |
| Override flagged | Admin | Review needed. |

## 11. Screen-to-Requirement Traceability

| Screens | Requirements and stories |
|---|---|
| SC-01 to SC-05 | FR-AUTH-1 to FR-AUTH-6, US-R1 |
| SC-R1 to SC-R3 | US-R2, US-R7 |
| SC-R4, SC-R5 | FR-SCH-1 to FR-SCH-5, US-R3, US-R4 |
| SC-R6, SC-D4 | FR-DEL-5, FR-DEL-6, US-R5, US-D3 |
| SC-R7, SC-S5 | FR-PCK-1, US-R6, US-S4 |
| SC-S2, SC-S3 | FR-PAR-1 to FR-PAR-8, US-S1 to US-S3 |
| SC-S4, SC-S6 | FR-PAR-6, FR-PAR-7, US-S2, US-S5 |
| SC-D1 to SC-D3 | FR-DEL-2 to FR-DEL-4, US-D1, US-D2 |
| SC-D5, SC-D6 | FR-DEL-7 to FR-DEL-9, US-D4 |
| SC-A1, SC-A2, SC-A11 | FR-AUD-3, FR-AUD-4, US-A5 |
| SC-A3, SC-A12 | FR-AUD-1, FR-AUD-2, FR-PCK-2, FR-PCK-3, US-A6 |
| SC-A4 to SC-A7 | FR-SOC-1 to FR-SOC-4, US-A1, US-A2 |
| SC-A8 to SC-A10 | FR-SOC-5, FR-SOC-6, FR-SCH-6, US-A3, US-A4 |
| SC-06, SC-07 | FR-NOT-1 to FR-NOT-5, US-R8 |

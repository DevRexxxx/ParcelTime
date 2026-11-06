# ParcelTime: User Flows

Version 1.0 (MVP). Companion to 01_PRD, 02_TRD, 03_Architecture, 04_MVP_Screens.

This document describes how each role moves through the product, step by step, including failure paths. It contains no code. Status names refer to the single parcel state machine defined in 06_System_Design_Rules.

---

## 1. Roles

| Role | Who | Primary device |
|---|---|---|
| Resident | Owner, tenant or family member linked to a unit | Phone (PWA) |
| Reception / Guard | Staff at the gate or guard cabin | Phone or shared tablet (PWA) |
| Delivery Executive | Staff who carry parcels to units | Phone (PWA) |
| Society Admin | Committee member or facility manager | Laptop or phone |
| Platform Admin | ParcelTime operator | Laptop |

A person can hold more than one role in a society (for example, reception and delivery in a small society). The interface shows a role switcher when that is the case.

---

## 2. Flow Index

1. Society onboarding (Platform Admin, Society Admin)
2. Resident invite and join
3. Parcel reception (Guard)
4. Resident notification and parcel view
5. Slot booking (Resident)
6. Reschedule and cancel (Resident)
7. Task assignment (Admin and Executive)
8. Doorstep delivery with OTP (Executive)
9. Failed delivery attempt (Executive)
10. Self-pickup from storage (Resident and Guard)
11. Unclaimed parcel aging (System, Admin)
12. Return to courier (Guard, Admin)
13. Delegate or family-member handover
14. Admin monitoring and exceptions

---

## 3. Flow 1: Society Onboarding

**Actors:** Platform Admin, Society Admin.

**Trigger:** A society signs the pilot agreement.

**Steps**
1. Platform Admin creates the society record: name, address, timezone (IST), contact person.
2. Platform Admin creates the first Society Admin account and sends an invite.
3. Society Admin accepts the invite and sets a password.
4. Society Admin uploads the unit list (tower, floor, unit number). The system validates and shows a preview with errors highlighted.
5. Society Admin fixes errors and confirms the import.
6. Society Admin defines storage locations (for example, Gate Rack A, Cabin Shelf 2) and their rough capacity.
7. Society Admin configures delivery slots: windows per day, capacity per window, booking cutoff, working days.
8. Society Admin adds staff (guards, executives) and assigns roles.
9. Society Admin sets the unclaimed-parcel rule (days before escalation).
10. Society is marked Active.

**Failure paths**
- Unit file has duplicates or missing fields: show row-level errors, allow download of an error report, import nothing until fixed.
- Staff phone number already exists in another society: allow, since membership is per society.

**Done when:** Society is Active with units, locations, slots and at least one reception user.

---

## 4. Flow 2: Resident Invite and Join

**Actors:** Resident, Society Admin.

**Steps**
1. Admin generates an invite code for a unit, or a general society code if the society prefers self-selection.
2. Admin shares the code through the society's usual channel.
3. Resident opens the web app and chooses Join with invite code.
4. Resident enters the code, name, phone and password.
5. Resident selects their unit (pre-filled if the code is unit-specific) and relationship: owner, tenant or family.
6. Resident submits and sees a "Waiting for approval" screen.
7. Admin sees the pending request, checks it against the unit record, and approves or rejects it with a reason.
8. Resident is notified of the decision. On approval, the resident lands on the home screen and is prompted to allow notifications and install the PWA.
9. Resident sees a one-time consent notice explaining what data is stored and why. Acceptance is recorded.

**Failure paths**
- Invalid or expired code: clear message, no hint about which part was wrong beyond "invalid or expired".
- Unit already has the maximum number of members: request goes to admin with a flag.
- Rejection: resident can resubmit once with corrections.
- Resident denies notifications: show an in-app banner explaining the in-app inbox is the fallback.

---

## 5. Flow 3: Parcel Reception

**Actors:** Guard.

**Goal:** Register a parcel in under 30 seconds.

**Steps**
1. Guard opens Receive Parcel from the home screen (one tap).
2. Guard scans the courier label barcode. The system reads tracking number and, where possible, infers the courier.
3. Guard confirms or selects the courier from a short list of common couriers.
4. Guard picks the unit using a typeahead (tower first, then unit number). Optionally selects a named recipient from the unit's members.
5. Guard takes one photo of the parcel (compressed on the device).
6. Guard picks the storage location (defaults to the last used one).
7. Guard taps Register.
8. System creates the parcel with status RECEIVED, generates the QR token, writes the audit entry, and queues the resident notification.
9. Guard sees a confirmation with the parcel code and an option to print or write the code on the parcel, then returns to the scan screen for the next parcel.

**Failure paths**
- Barcode unreadable: manual tracking number entry, or skip the tracking number and use a system-generated reference.
- Duplicate tracking number for the same courier and society: show the existing parcel and ask whether this is a different parcel before allowing a second record.
- No network: parcel is saved in the offline queue with a visible "Pending sync" badge. On reconnect, it syncs in order. Conflicts (for example, duplicate detected on sync) go to a review list.
- Unit not found: guard can flag "Unknown unit" and the parcel is held for admin review.
- Photo fails to upload: parcel registration is not blocked; the photo uploads in the background.

---

## 6. Flow 4: Resident Notification and Parcel View

**Actors:** Resident.

**Steps**
1. System sends a push notification and adds an inbox item: "A parcel from [courier] has arrived for your unit."
2. Resident opens the app and sees the parcel card: courier, arrival time, photo, current status, location.
3. Resident chooses one of: Schedule delivery, Self-pickup, or Do nothing for now.
4. If the resident does nothing, the reminder schedule applies (see System Design Rules).

**Notes**
- All household members linked to the unit see the parcel. A named recipient is shown but does not restrict visibility within the unit.
- The resident never sees parcels of other units, even by guessing identifiers.

---

## 7. Flow 5: Slot Booking

**Actors:** Resident.

**Steps**
1. Resident taps Schedule delivery on a parcel (or selects multiple parcels for one slot).
2. System shows the next available days and the slots per day with remaining capacity indicators (Available, Few left, Full). Slots past the cutoff are hidden or disabled with a reason.
3. Resident picks a slot and adds an optional note (for example, "Ring the bell once").
4. Resident confirms.
5. System checks capacity inside a single transaction, reserves the slot, sets the parcel to SCHEDULED, and writes the audit entry.
6. Resident sees a confirmation with the slot, and a reminder is queued.

**Failure paths**
- Slot filled between viewing and confirming: show "That slot was just taken", refresh availability, keep the resident's note.
- Cutoff passed: slot is disabled with an explanation.
- Parcel not in a bookable state (for example, already out for delivery): explain the current status.
- Resident has already reached the daily booking limit set by the society: explain the limit.

---

## 8. Flow 6: Reschedule and Cancel

**Actors:** Resident.

**Steps (reschedule)**
1. Resident opens a scheduled parcel and taps Reschedule.
2. System shows slots using the same availability rules, excluding the current one.
3. Resident picks a new slot and confirms.
4. System releases the old slot and reserves the new one in one transaction, writes an audit entry, and updates any existing task.

**Steps (cancel delivery)**
1. Resident taps Cancel delivery.
2. System releases the slot, returns the parcel to RECEIVED (still in storage), and notifies reception if a task existed.

**Rules**
- Reschedule or cancel is allowed only before the cutoff for that slot and only while the parcel is SCHEDULED or ASSIGNED.
- After a task is OUT_FOR_DELIVERY, the resident cannot change it. They can contact the society through the support contact shown on screen.
- Reschedule count per parcel is limited by society setting to prevent abuse.

---

## 9. Flow 7: Task Assignment

**Actors:** Society Admin, Delivery Executive.

**Two supported modes (society chooses one):**

**Mode A: Admin assigns**
1. Before each slot window, admin opens the Planning screen showing scheduled parcels grouped by slot and tower.
2. Admin selects parcels and assigns them to an executive.
3. Executive is notified and sees tasks on their list.

**Mode B: Pool and claim**
1. Scheduled parcels appear in a shared pool for the slot.
2. Executives claim tasks. The first valid claim wins; the second gets a "Already claimed" message.
3. Admin can reassign any task at any time before OUT_FOR_DELIVERY.

**Failure paths**
- No executive available for a slot: admin sees a warning that scheduled count exceeds staffed capacity and can reduce capacity for future bookings.
- Executive goes off shift with open tasks: admin reassigns from the Planning screen.

---

## 10. Flow 8: Doorstep Delivery with OTP

**Actors:** Executive, Resident (or authorized receiver).

**Steps**
1. Executive opens their task list for the current slot, grouped by tower and floor.
2. Executive collects the parcels from storage. For each parcel, executive scans the parcel QR to confirm they have the right item. System marks the parcel OUT_FOR_DELIVERY and records the custody handoff from storage to executive.
3. Resident is notified: "Your parcel is on its way."
4. Executive reaches the unit and shows the parcel. The resident opens the parcel in their app, which displays a six-digit code.
5. Executive enters the code in the task screen.
6. On a correct code, system marks the parcel DELIVERED, records time, executive and photo (optional), and writes the audit entry.
7. Resident sees a delivery confirmation. The slot count is closed out.

**Failure paths**
- Wrong code: show remaining attempts. After the attempt limit, the code locks and the executive must record a failed attempt or ask the resident to generate a fresh code once.
- Code expired: resident taps Generate new code.
- Resident's phone is dead or app unavailable: executive can use the fallback in Flow 13 (delegate) or mark the attempt as failed.
- Executive scans the wrong parcel QR: system rejects it and shows which unit the scanned parcel belongs to.

---

## 11. Flow 9: Failed Delivery Attempt

**Actors:** Executive, Resident, Admin.

**Steps**
1. Executive taps Could not deliver and selects a reason: nobody home, resident refused, wrong unit, OTP not available, other (with note).
2. System records a delivery attempt, increments the attempt count, and returns the parcel to storage.
3. Executive scans the parcel back into a storage location, restoring custody to storage.
4. Parcel status returns to RECEIVED (or to a dedicated attempted state if the society wants to see it separately).
5. Resident is notified with the reason and prompted to reschedule or pick up.
6. If failed attempts reach the society limit, the parcel is flagged for admin attention.

**Rules**
- Reasons are mandatory so failure analytics are meaningful.
- Optional photo evidence (for example, the closed door) is encouraged but not required.

---

## 12. Flow 10: Self-Pickup from Storage

**Actors:** Resident, Guard.

**Steps**
1. Resident taps Self-pickup on a parcel. The parcel gets a pickup code or the resident simply shows the parcel QR.
2. Resident visits the guard cabin and shows the QR or code.
3. Guard scans it. System verifies it belongs to an authorized member of the unit.
4. Guard locates the parcel using the storage location shown, hands it over and confirms handover.
5. If the policy requires, resident verifies using the OTP shown in their app, same as doorstep delivery.
6. Parcel becomes DELIVERED with method self-pickup.

**Failure paths**
- Person at the cabin cannot show the app: guard can look up the unit, but a handover then needs the admin-defined fallback (for example, an ID check and a note), recorded in the audit log with the guard's identity.
- Parcel not at the recorded location: guard flags a misplacement, which raises an admin alert and starts a search task.

---

## 13. Flow 11: Unclaimed Parcel Aging

**Actors:** System, Admin, Resident.

**Steps**
1. A background job checks parcels in RECEIVED or SCHEDULED states older than the configured days.
2. System sends escalating reminders to the unit (for example, first, then second, then final notice).
3. At the threshold, parcel becomes UNCLAIMED and appears in the admin exceptions list.
4. Admin chooses: contact the resident, extend storage, return to courier, or other action defined by the society policy.
5. Every action is recorded in the audit log.

---

## 14. Flow 12: Return to Courier

**Actors:** Guard, Admin.

**Steps**
1. Admin or guard selects an UNCLAIMED or refused parcel and chooses Return to courier.
2. Guard records the courier pickup: courier name, person collecting, optional photo.
3. Parcel becomes RETURNED_TO_COURIER. Resident is notified.

---

## 15. Flow 13: Delegate or Family-Member Handover

**Purpose:** Handle cases where the named recipient is not available but another authorized person is.

**Steps**
1. Any member of the unit can open the parcel in their own app and see the code. Because the code is tied to the unit and parcel, any linked member can complete the handover.
2. For non-members (neighbor, domestic help), the resident can authorize a delegate from the parcel screen, naming the person. The code is still shown only in the resident's app and shared by the resident at their discretion.
3. The delivery record stores who actually received the parcel (name and relationship) when different from the recipient.

**Rule:** Guards and executives never receive the code through the system. Only the resident side does.

---

## 16. Flow 14: Admin Monitoring and Exceptions

**Actors:** Society Admin.

**Daily view**
1. Dashboard shows parcels received today, in storage, scheduled by slot, out for delivery, delivered, failed, and unclaimed.
2. Exceptions list shows: unknown-unit parcels, duplicate warnings, repeated failed deliveries, misplaced parcels, aging parcels, over-capacity slots.
3. Admin opens any parcel to see the full timeline: who did what and when, from the audit log.
4. Admin can export a report for a date range.

---

## 17. Cross-Flow Principles

- **One parcel, one status.** Every flow changes status only through the state machine.
- **Every transition is audited.** Actor, time, previous and new status, and reason.
- **Residents see only their unit.** Staff see only their society. Admins see only their society.
- **Always show the next step.** Every error state names what the person can do next.
- **Mobile first, one hand.** Primary actions sit in the lower half of the screen and tap targets are large.
- **Offline tolerant at the gate.** Reception can register parcels without a connection and sync later.

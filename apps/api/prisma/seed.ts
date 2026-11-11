import {
  PrismaClient,
  UserRole,
  ParcelStatus,
  SlotInstanceStatus,
  TaskStatus,
  DeliveryScheduleStatus,
  SocietyStatus,
  AssignmentMode,
  MemberStatus,
  UnitMembershipType,
  UnitMembershipStatus,
  OtpChallengeStatus,
  NotificationCategory,
  ShipmentExternalStatus,
  ShipmentInternalStatus,
  ShipmentDiscoverySource,
  IntegrationProvider,
  IntegrationStatus,
  ShipmentEventDomain,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

const DEMO_SOCIETY_NAME = 'Greenwood Palms Residences';
const DEMO_EMAILS = [
  'platform@parceltime.in',
  'admin@greenwood.in',
  'reception@greenwood.in',
  'rajesh.exec@greenwood.in',
  'priya.sharma@gmail.com',
  'arun.patel@gmail.com',
];

async function hashPassword(plain: string) {
  return await bcrypt.hash(plain, 10);
}

function hashOtp(parcelId: string, otp: string): string {
  const secret = process.env.OTP_SECRET || 'parceltime_production_otp_hmac_secret_key_2026';
  return crypto.createHmac('sha256', secret).update(`${parcelId}:${otp}`).digest('hex');
}

async function main() {
  // §3.1 / P0 Security Check: Block seed demo credentials in production
  if (process.env.NODE_ENV === 'production') {
    console.error(
      '⛔ FATAL: Database seeding is blocked in production environment (NODE_ENV=production). Demo credentials must never be seeded to production.'
    );
    process.exit(1);
  }

  console.log('🌱 Starting database seed...');

  // 0. Idempotent cleanup: Safely clear previous demo records if they exist
  const existingSociety = await prisma.society.findFirst({
    where: { name: DEMO_SOCIETY_NAME },
  });

  if (existingSociety) {
    console.log(`🧹 Cleaning up existing demo data for "${DEMO_SOCIETY_NAME}"...`);
    const societyId = existingSociety.id;

    // Delete in reverse dependency order
    await prisma.auditLog.deleteMany({ where: { societyId } });
    await prisma.notification.deleteMany({ where: { societyId } });
    await prisma.outboxEvent.deleteMany({ where: { societyId } });
    await prisma.shipmentEvent.deleteMany({ where: { shipment: { societyId } } });
    await prisma.shipmentSourceReference.deleteMany({ where: { shipment: { societyId } } });
    await prisma.shipment.deleteMany({ where: { societyId } });
    await prisma.integrationSyncLog.deleteMany({ where: { integration: { societyId } } });
    await prisma.externalIntegration.deleteMany({ where: { societyId } });
    await prisma.handoverChallenge.deleteMany({ where: { parcel: { societyId } } });
    await prisma.deliveryTask.deleteMany({ where: { parcel: { societyId } } });
    await prisma.deliverySchedule.deleteMany({ where: { parcel: { societyId } } });
    await prisma.pickupRequest.deleteMany({ where: { parcel: { societyId } } });
    await prisma.parcel.deleteMany({ where: { societyId } });
    await prisma.slotInstance.deleteMany({ where: { societyId } });
    await prisma.slotTemplate.deleteMany({ where: { societyId } });
    await prisma.storageLocation.deleteMany({ where: { societyId } });
    await prisma.unitMembership.deleteMany({ where: { unit: { societyId } } });
    await prisma.unit.deleteMany({ where: { societyId } });
    await prisma.tower.deleteMany({ where: { societyId } });
    await prisma.societyMember.deleteMany({ where: { societyId } });
    await prisma.invite.deleteMany({ where: { societyId } });
    await prisma.joinRequest.deleteMany({ where: { societyId } });
    await prisma.society.delete({ where: { id: societyId } });
  }

  // Remove existing demo users to prevent unique constraint conflicts
  await prisma.notificationPreference.deleteMany({
    where: { user: { email: { in: DEMO_EMAILS } } },
  });
  await prisma.deviceToken.deleteMany({
    where: { user: { email: { in: DEMO_EMAILS } } },
  });
  await prisma.user.deleteMany({
    where: { email: { in: DEMO_EMAILS } },
  });

  // 1. Create Society
  const society = await prisma.society.create({
    data: {
      name: DEMO_SOCIETY_NAME,
      address: '104 Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103',
      timezone: 'Asia/Kolkata',
      status: SocietyStatus.ACTIVE,
      slotCutoffHours: 2,
      schedulingHorizonDays: 14,
      unclaimedThresholdDays: 7,
      photoRequired: true,
      otpExpiryMinutes: 15,
      maxFailedAttempts: 5,
      assignmentMode: AssignmentMode.POOL,
    },
  });
  console.log(`Created society: ${society.name} (${society.id})`);

  // 2. Create Towers & Units
  const towerA = await prisma.tower.create({
    data: { societyId: society.id, name: 'Tower A - Aspen' },
  });
  const towerB = await prisma.tower.create({
    data: { societyId: society.id, name: 'Tower B - Birch' },
  });

  const unitA101 = await prisma.unit.create({
    data: { societyId: society.id, towerId: towerA.id, floor: 1, unitNumber: '101' },
  });
  const unitA102 = await prisma.unit.create({
    data: { societyId: society.id, towerId: towerA.id, floor: 1, unitNumber: '102' },
  });
  const unitB302 = await prisma.unit.create({
    data: { societyId: society.id, towerId: towerB.id, floor: 3, unitNumber: '302' },
  });

  // 3. Create Storage Locations
  const locReception = await prisma.storageLocation.create({
    data: { societyId: society.id, name: 'Reception Front Counter', capacity: 30 },
  });
  const locShelfA = await prisma.storageLocation.create({
    data: { societyId: society.id, name: 'Storage Vault - Shelf A', capacity: 80 },
  });
  const locShelfB = await prisma.storageLocation.create({
    data: { societyId: society.id, name: 'Storage Vault - Shelf B', capacity: 80 },
  });
  const locLocker = await prisma.storageLocation.create({
    data: { societyId: society.id, name: 'Smart Locker Bay 1', capacity: 40 },
  });

  // 4. Create Users for all roles
  const defaultPwHash = await hashPassword('ParcelTime@2026');

  // Platform Admin
  await prisma.user.create({
    data: {
      name: 'Aditya Rao (HQ)',
      email: 'platform@parceltime.in',
      phone: '+919800000001',
      passwordHash: defaultPwHash,
      memberships: {
        create: { societyId: society.id, roles: [UserRole.PLATFORM_ADMIN], status: MemberStatus.ACTIVE },
      },
    },
  });

  // Society Admin
  const societyAdmin = await prisma.user.create({
    data: {
      name: 'Suresh Menon (Estate Manager)',
      email: 'admin@greenwood.in',
      phone: '+919800000002',
      passwordHash: defaultPwHash,
      memberships: {
        create: { societyId: society.id, roles: [UserRole.SOCIETY_ADMIN], status: MemberStatus.ACTIVE },
      },
    },
  });

  // Reception Staff
  const receptionGuard = await prisma.user.create({
    data: {
      name: 'Ramesh Guard (Gate 1 Reception)',
      email: 'reception@greenwood.in',
      phone: '+919800000003',
      passwordHash: defaultPwHash,
      memberships: {
        create: { societyId: society.id, roles: [UserRole.RECEPTION], status: MemberStatus.ACTIVE },
      },
    },
  });

  // Delivery Executive
  const deliveryExec = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar (Internal Courier)',
      email: 'rajesh.exec@greenwood.in',
      phone: '+919800000004',
      passwordHash: defaultPwHash,
      memberships: {
        create: { societyId: society.id, roles: [UserRole.DELIVERY_EXECUTIVE], status: MemberStatus.ACTIVE },
      },
    },
  });

  // Resident 1 (Unit A-102 Owner — Priya Sharma)
  const residentPriya = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      phone: '+919800000005',
      passwordHash: defaultPwHash,
      memberships: {
        create: { societyId: society.id, roles: [UserRole.RESIDENT], status: MemberStatus.ACTIVE },
      },
      unitMemberships: {
        create: { unitId: unitA102.id, type: UnitMembershipType.OWNER, status: UnitMembershipStatus.ACTIVE },
      },
    },
  });

  // Resident 2 (Unit B-302 Tenant — Arun Patel)
  const residentArun = await prisma.user.create({
    data: {
      name: 'Arun Patel',
      email: 'arun.patel@gmail.com',
      phone: '+919800000006',
      passwordHash: defaultPwHash,
      memberships: {
        create: { societyId: society.id, roles: [UserRole.RESIDENT], status: MemberStatus.ACTIVE },
      },
      unitMemberships: {
        create: { unitId: unitB302.id, type: UnitMembershipType.TENANT, status: UnitMembershipStatus.ACTIVE },
      },
    },
  });

  // Resident Notification Preferences
  const categories = Object.values(NotificationCategory);
  for (const cat of categories) {
    await prisma.notificationPreference.create({
      data: {
        userId: residentPriya.id,
        category: cat,
        enabled: true,
      },
    });
  }

  // 5. Create Slot Templates
  const templateMorning = await prisma.slotTemplate.create({
    data: {
      societyId: society.id,
      label: 'Morning Window',
      startTime: '09:00',
      endTime: '11:00',
      capacity: 15,
      activeWeekdays: [0, 1, 2, 3, 4, 5, 6],
    },
  });

  const templateAfternoon = await prisma.slotTemplate.create({
    data: {
      societyId: society.id,
      label: 'Afternoon Window',
      startTime: '14:00',
      endTime: '16:00',
      capacity: 20,
      activeWeekdays: [0, 1, 2, 3, 4, 5, 6],
    },
  });

  const templateEvening = await prisma.slotTemplate.create({
    data: {
      societyId: society.id,
      label: 'Evening Window',
      startTime: '18:30',
      endTime: '20:30',
      capacity: 25,
      activeWeekdays: [0, 1, 2, 3, 4, 5, 6],
    },
  });

  // 6. Create Slot Instances for Today & Tomorrow
  const todayStr = dayjs().format('YYYY-MM-DD');
  const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD');

  const slotTodayEvening = await prisma.slotInstance.create({
    data: {
      societyId: society.id,
      templateId: templateEvening.id,
      date: todayStr,
      startTime: '18:30',
      endTime: '20:30',
      capacity: templateEvening.capacity,
      bookedCount: 1,
      status: SlotInstanceStatus.OPEN,
    },
  });

  const slotTomorrowMorning = await prisma.slotInstance.create({
    data: {
      societyId: society.id,
      templateId: templateMorning.id,
      date: tomorrowStr,
      startTime: '09:00',
      endTime: '11:00',
      capacity: templateMorning.capacity,
      bookedCount: 1,
      status: SlotInstanceStatus.OPEN,
    },
  });

  // 7. Create Sample Parcels (aligned with UI & Mock Data)
  // Parcel 1: RECEIVED (Waiting for resident to schedule - Unit A-102)
  const parcelReceived1 = await prisma.parcel.create({
    data: {
      societyId: society.id,
      parcelCode: 'PT-8942',
      courier: 'Amazon Logistics',
      trackingNumber: 'AZ-IN-981245710',
      unitId: unitA102.id,
      recipientName: 'Priya Sharma',
      receivedById: receptionGuard.id,
      storageLocationId: locShelfA.id,
      status: ParcelStatus.RECEIVED,
      notes: 'Fragile: Electronics package inside box',
    },
  });

  // Parcel 2: RECEIVED (Second parcel for Unit A-102 — enables Smart Consolidation testing)
  const parcelReceived2 = await prisma.parcel.create({
    data: {
      societyId: society.id,
      parcelCode: 'PT-5519',
      courier: 'Myntra Fashion',
      trackingNumber: 'MYN-4918230',
      unitId: unitA102.id,
      recipientName: 'Priya Sharma',
      receivedById: receptionGuard.id,
      storageLocationId: locShelfB.id,
      status: ParcelStatus.RECEIVED,
      notes: 'Apparel box - eligible for consolidation with PT-8942',
    },
  });

  // Parcel 3: SCHEDULED (Slot booked for tomorrow morning - Unit A-102)
  const parcelScheduled = await prisma.parcel.create({
    data: {
      societyId: society.id,
      parcelCode: 'PT-9104',
      courier: 'Blue Dart Express',
      trackingNumber: 'BD-776192803',
      unitId: unitA102.id,
      recipientName: 'Priya Sharma',
      receivedById: receptionGuard.id,
      storageLocationId: locShelfA.id,
      status: ParcelStatus.SCHEDULED,
      notes: 'Ring the doorbell twice please',
    },
  });

  const schedulePriyaMorning = await prisma.deliverySchedule.create({
    data: {
      parcelId: parcelScheduled.id,
      requestedById: residentPriya.id,
      slotInstanceId: slotTomorrowMorning.id,
      deliveryNote: 'Ring the doorbell twice please',
      status: DeliveryScheduleStatus.ACTIVE,
    },
  });

  await prisma.deliveryTask.create({
    data: {
      scheduleId: schedulePriyaMorning.id,
      parcelId: parcelScheduled.id,
      status: TaskStatus.OPEN,
    },
  });

  // Parcel 4: OUT_FOR_DELIVERY (Active delivery for Priya Sharma with Executive Rajesh Kumar)
  const parcelOut = await prisma.parcel.create({
    data: {
      societyId: society.id,
      parcelCode: 'PT-7621',
      courier: 'Delhivery',
      trackingNumber: 'DLV-449102847',
      unitId: unitA102.id,
      recipientName: 'Priya Sharma',
      receivedById: receptionGuard.id,
      storageLocationId: locLocker.id,
      status: ParcelStatus.OUT_FOR_DELIVERY,
      notes: 'Approaching Tower A with courier Rajesh Kumar',
    },
  });

  const schedulePriyaEvening = await prisma.deliverySchedule.create({
    data: {
      parcelId: parcelOut.id,
      requestedById: residentPriya.id,
      slotInstanceId: slotTodayEvening.id,
      status: DeliveryScheduleStatus.ACTIVE,
    },
  });

  const taskOut = await prisma.deliveryTask.create({
    data: {
      scheduleId: schedulePriyaEvening.id,
      parcelId: parcelOut.id,
      executiveId: deliveryExec.id,
      assignedById: societyAdmin.id,
      assignedAt: new Date(Date.now() - 30 * 60 * 1000),
      startedAt: new Date(Date.now() - 10 * 60 * 1000),
      status: TaskStatus.IN_PROGRESS,
    },
  });

  const demoOtp = '482910';
  await prisma.handoverChallenge.create({
    data: {
      parcelId: parcelOut.id,
      taskId: taskOut.id,
      hashedOtp: hashOtp(parcelOut.id, demoOtp),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      maxAttempts: 5,
      attemptsUsed: 0,
      status: OtpChallengeStatus.ACTIVE,
    },
  });

  // Parcel 5: DELIVERED (Historical self-pickup at Gate 1)
  const parcelDelivered = await prisma.parcel.create({
    data: {
      societyId: society.id,
      parcelCode: 'PT-6310',
      courier: 'DTDC',
      trackingNumber: 'DTDC-8812903',
      unitId: unitA102.id,
      recipientName: 'Priya Sharma',
      receivedById: receptionGuard.id,
      storageLocationId: locReception.id,
      status: ParcelStatus.DELIVERED,
      statusUpdatedAt: new Date(Date.now() - 24 * 3600 * 1000),
    },
  });

  // Parcel 6: Multi-tenant / Multi-resident parcel (Unit B-302 — Arun Patel)
  const parcelArun = await prisma.parcel.create({
    data: {
      societyId: society.id,
      parcelCode: 'PT-3301',
      courier: 'Ekart Logistics',
      trackingNumber: 'EKART-9921470',
      unitId: unitB302.id,
      recipientName: 'Arun Patel',
      receivedById: receptionGuard.id,
      storageLocationId: locShelfA.id,
      status: ParcelStatus.RECEIVED,
      notes: 'Standard carton',
    },
  });

  // 8. Create USIE Live Shipments & External Integrations
  // Shipment 1: Inbound Amazon shipment matched to PT-8942
  const shipmentAmazon = await prisma.shipment.create({
    data: {
      societyId: society.id,
      residentId: residentPriya.id,
      unitId: unitA102.id,
      orderReference: 'ORD-AMZ-2026-891',
      merchantName: 'Amazon India',
      trackingNumber: 'AZ-IN-981245710',
      carrierCode: 'AMAZON_LOGISTICS',
      discoverySource: ShipmentDiscoverySource.GMAIL,
      externalStatus: ShipmentExternalStatus.DELIVERED_TO_SOCIETY,
      internalStatus: ShipmentInternalStatus.STORED,
      estimatedDeliveryAt: new Date(),
      lastCarrierEventAt: new Date(Date.now() - 2 * 3600 * 1000),
      lastSyncedAt: new Date(),
      matchConfidence: 1.0,
      matchedParcelId: parcelReceived1.id,
      sourceReferences: {
        create: {
          sourceType: ShipmentDiscoverySource.GMAIL,
          externalReference: 'ORD-AMZ-2026-891',
        },
      },
      events: {
        create: [
          {
            eventDomain: ShipmentEventDomain.EXTERNAL_CARRIER,
            eventCode: 'PICKED_UP',
            status: ShipmentExternalStatus.PICKED_UP,
            description: 'Package picked up by courier',
            occurredAt: new Date(Date.now() - 24 * 3600 * 1000),
            sourceProvider: 'AMAZON_LOGISTICS',
          },
          {
            eventDomain: ShipmentEventDomain.EXTERNAL_CARRIER,
            eventCode: 'DELIVERED_TO_SOCIETY',
            status: ShipmentExternalStatus.DELIVERED_TO_SOCIETY,
            description: 'Handed over at Greenwood Palms Gate 1 reception',
            occurredAt: new Date(Date.now() - 2 * 3600 * 1000),
            sourceProvider: 'AMAZON_LOGISTICS',
          },
        ],
      },
    },
  });

  // Shipment 2: Delhivery in-transit shipment matched to PT-7621
  await prisma.shipment.create({
    data: {
      societyId: society.id,
      residentId: residentPriya.id,
      unitId: unitA102.id,
      orderReference: 'ORD-DLV-77192',
      merchantName: 'Delhivery Direct',
      trackingNumber: 'DLV-449102847',
      carrierCode: 'DELHIVERY',
      discoverySource: ShipmentDiscoverySource.MANUAL,
      externalStatus: ShipmentExternalStatus.OUT_FOR_DELIVERY,
      internalStatus: ShipmentInternalStatus.OUT_FOR_INTERNAL_DELIVERY,
      estimatedDeliveryAt: new Date(),
      lastCarrierEventAt: new Date(Date.now() - 30 * 60 * 1000),
      lastSyncedAt: new Date(),
      matchConfidence: 1.0,
      matchedParcelId: parcelOut.id,
      events: {
        create: [
          {
            eventDomain: ShipmentEventDomain.EXTERNAL_CARRIER,
            eventCode: 'OUT_FOR_DELIVERY',
            status: ShipmentExternalStatus.OUT_FOR_DELIVERY,
            description: 'Out for doorstep delivery with executive Rajesh Kumar',
            occurredAt: new Date(Date.now() - 30 * 60 * 1000),
            sourceProvider: 'DELHIVERY',
          },
        ],
      },
    },
  });

  // External Integration: Gmail Connected for Priya Sharma
  await prisma.externalIntegration.create({
    data: {
      societyId: society.id,
      userId: residentPriya.id,
      provider: IntegrationProvider.GMAIL,
      status: IntegrationStatus.ACTIVE,
      grantedScopes: ['https://www.googleapis.com/auth/gmail.readonly'],
      lastSyncedAt: new Date(),
    },
  });

  // 9. Audit Trail
  await prisma.auditLog.createMany({
    data: [
      {
        societyId: society.id,
        parcelId: parcelReceived1.id,
        actorId: receptionGuard.id,
        actorRole: UserRole.RECEPTION,
        eventType: 'PARCEL_RECEIVED',
        newStatus: 'RECEIVED',
      },
      {
        societyId: society.id,
        parcelId: parcelReceived2.id,
        actorId: receptionGuard.id,
        actorRole: UserRole.RECEPTION,
        eventType: 'PARCEL_RECEIVED',
        newStatus: 'RECEIVED',
      },
      {
        societyId: society.id,
        parcelId: parcelScheduled.id,
        actorId: residentPriya.id,
        actorRole: UserRole.RESIDENT,
        eventType: 'SLOT_SCHEDULED',
        previousStatus: 'RECEIVED',
        newStatus: 'SCHEDULED',
      },
      {
        societyId: society.id,
        parcelId: parcelOut.id,
        actorId: deliveryExec.id,
        actorRole: UserRole.DELIVERY_EXECUTIVE,
        eventType: 'OUT_FOR_DELIVERY',
        previousStatus: 'ASSIGNED',
        newStatus: 'OUT_FOR_DELIVERY',
      },
      {
        societyId: society.id,
        parcelId: parcelDelivered.id,
        actorId: receptionGuard.id,
        actorRole: UserRole.RECEPTION,
        eventType: 'PICKUP_COMPLETED',
        previousStatus: 'RECEIVED',
        newStatus: 'DELIVERED',
      },
    ],
  });

  // 10. In-App Notifications
  await prisma.notification.createMany({
    data: [
      {
        societyId: society.id,
        userId: residentPriya.id,
        type: NotificationCategory.PARCEL_RECEIVED,
        title: 'New Parcel Arrived!',
        message: 'Your Amazon Logistics parcel (PT-8942) has arrived at the reception desk. Schedule your delivery window.',
        relatedParcelId: parcelReceived1.id,
      },
      {
        societyId: society.id,
        userId: residentPriya.id,
        type: NotificationCategory.OUT_FOR_DELIVERY,
        title: 'Out for Doorstep Delivery',
        message: 'Your Delhivery parcel (PT-7621) is out for delivery with Rajesh Kumar. Your OTP is ready.',
        relatedParcelId: parcelOut.id,
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log(`Demo OTP for out-for-delivery parcel PT-7621 is: ${demoOtp}`);
  console.log('Active Demo Accounts:');
  console.log('  - Resident:           priya.sharma@gmail.com  (Unit A-102 Owner)');
  console.log('  - Resident:           arun.patel@gmail.com    (Unit B-302 Tenant)');
  console.log('  - Delivery Executive: rajesh.exec@greenwood.in');
  console.log('  - Reception Staff:    reception@greenwood.in');
  console.log('  - Society Admin:      admin@greenwood.in');
  console.log('  - Platform Admin:     platform@parceltime.in');
  console.log('All accounts password:  ParcelTime@2026');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

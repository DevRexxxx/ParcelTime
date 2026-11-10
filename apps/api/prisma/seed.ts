import { PrismaClient, UserRole, ParcelStatus, SlotInstanceStatus, TaskStatus, DeliveryScheduleStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

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
    console.error('⛔ FATAL: Database seeding is blocked in production environment (NODE_ENV=production). Demo credentials must never be seeded to production.');
    process.exit(1);
  }

  console.log('🌱 Starting database seed...');

  // 1. Create Society
  const society = await prisma.society.create({
    data: {
      name: 'Greenwood Palms Residences',
      address: '104 Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103',
      timezone: 'Asia/Kolkata',
      status: 'ACTIVE',
      slotCutoffHours: 2,
      schedulingHorizonDays: 14,
      unclaimedThresholdDays: 7,
      photoRequired: true,
      otpExpiryMinutes: 15,
      maxFailedAttempts: 5,
      assignmentMode: 'POOL',
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
  const locLocker = await prisma.storageLocation.create({
    data: { societyId: society.id, name: 'Smart Locker Bay 1', capacity: 40 },
  });

  // 4. Create Users for all roles
  const defaultPwHash = await hashPassword('ParcelTime@2026');

  // Platform Admin
  const platformAdmin = await prisma.user.create({
    data: {
      name: 'Aditya Rao (HQ)',
      email: 'platform@parceltime.in',
      phone: '+919800000001',
      passwordHash: defaultPwHash,
      memberships: {
        create: { societyId: society.id, roles: [UserRole.PLATFORM_ADMIN], status: 'ACTIVE' },
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
        create: { societyId: society.id, roles: [UserRole.SOCIETY_ADMIN], status: 'ACTIVE' },
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
        create: { societyId: society.id, roles: [UserRole.RECEPTION], status: 'ACTIVE' },
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
        create: { societyId: society.id, roles: [UserRole.DELIVERY_EXECUTIVE], status: 'ACTIVE' },
      },
    },
  });

  // Resident 1 (Unit A-102)
  const residentPriya = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      phone: '+919800000005',
      passwordHash: defaultPwHash,
      memberships: {
        create: { societyId: society.id, roles: [UserRole.RESIDENT], status: 'ACTIVE' },
      },
      unitMemberships: {
        create: { unitId: unitA102.id, type: 'OWNER', status: 'ACTIVE' },
      },
    },
  });

  // Resident 2 (Unit B-302)
  const residentArun = await prisma.user.create({
    data: {
      name: 'Arun Patel',
      email: 'arun.patel@gmail.com',
      phone: '+919800000006',
      passwordHash: defaultPwHash,
      memberships: {
        create: { societyId: society.id, roles: [UserRole.RESIDENT], status: 'ACTIVE' },
      },
      unitMemberships: {
        create: { unitId: unitB302.id, type: 'TENANT', status: 'ACTIVE' },
      },
    },
  });

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

  // 7. Create Sample Parcels
  // Parcel 1: RECEIVED (Waiting for resident to schedule)
  const parcelReceived = await prisma.parcel.create({
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
      notes: 'Fragile - Glassware inside box',
    },
  });

  // Parcel 2: SCHEDULED (Slot booked for tomorrow morning)
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
      notes: 'Call before arriving',
    },
  });

  const schedule2 = await prisma.deliverySchedule.create({
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
      scheduleId: schedule2.id,
      parcelId: parcelScheduled.id,
      status: TaskStatus.OPEN,
    },
  });

  // Parcel 3: OUT_FOR_DELIVERY with active Handover Challenge
  const parcelOut = await prisma.parcel.create({
    data: {
      societyId: society.id,
      parcelCode: 'PT-7621',
      courier: 'Delhivery',
      trackingNumber: 'DLV-449102847',
      unitId: unitB302.id,
      recipientName: 'Arun Patel',
      receivedById: receptionGuard.id,
      storageLocationId: locLocker.id,
      status: ParcelStatus.OUT_FOR_DELIVERY,
    },
  });

  const schedule3 = await prisma.deliverySchedule.create({
    data: {
      parcelId: parcelOut.id,
      requestedById: residentArun.id,
      slotInstanceId: slotTodayEvening.id,
      status: DeliveryScheduleStatus.ACTIVE,
    },
  });

  const task3 = await prisma.deliveryTask.create({
    data: {
      scheduleId: schedule3.id,
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
      taskId: task3.id,
      hashedOtp: hashOtp(parcelOut.id, demoOtp),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      maxAttempts: 5,
      attemptsUsed: 0,
      status: 'ACTIVE',
    },
  });

  // Parcel 4: DELIVERED (historical)
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

  // Audit trail
  await prisma.auditLog.createMany({
    data: [
      {
        societyId: society.id,
        parcelId: parcelReceived.id,
        actorId: receptionGuard.id,
        actorRole: UserRole.RECEPTION,
        eventType: 'PARCEL_RECEIVED',
        newStatus: 'RECEIVED',
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
    ],
  });

  // Notification for resident
  await prisma.notification.create({
    data: {
      societyId: society.id,
      userId: residentPriya.id,
      type: 'PARCEL_RECEIVED',
      title: 'New Parcel Arrived!',
      message: 'Your Amazon Logistics parcel (PT-8942) has arrived at the reception desk. Schedule your delivery window.',
      relatedParcelId: parcelReceived.id,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`Demo OTP for out-for-delivery parcel PT-7621 is: ${demoOtp}`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


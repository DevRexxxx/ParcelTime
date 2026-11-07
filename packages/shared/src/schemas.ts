import { z } from 'zod';
import {
  UserRole,
  UnitMembershipType,
  FailureReason,
  VerificationMethod,
  SlotInstanceStatus,
  NotificationCategory,
} from './enums';

// Auth schemas
export const LoginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export const AcceptInviteSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(100),
  phone: z.string().optional(),
});

export const ForgotPasswordSchema = z.object({
  identifier: z.string().min(1),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
});

export const JoinRequestSchema = z.object({
  societyCode: z.string().optional(),
  societyId: z.string().uuid().optional(),
  unitId: z.string().uuid(),
  relationship: z.nativeEnum(UnitMembershipType),
});

// Society schemas
export const CreateSocietySchema = z.object({
  name: z.string().min(2).max(200),
  address: z.string().min(5).max(500),
  timezone: z.string().default('Asia/Kolkata'),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

export const UpdateSocietySettingsSchema = z.object({
  slotCutoffHours: z.number().int().min(0).max(72).optional(),
  schedulingHorizonDays: z.number().int().min(1).max(60).optional(),
  unclaimedThresholdDays: z.number().int().min(1).max(90).optional(),
  photoRequired: z.boolean().optional(),
  otpExpiryMinutes: z.number().int().min(1).max(60).optional(),
  maxFailedAttempts: z.number().int().min(1).max(10).optional(),
});

// Unit schemas
export const CreateUnitSchema = z.object({
  towerId: z.string().uuid(),
  floor: z.number().int().min(-5).max(200),
  unitNumber: z.string().min(1).max(20),
});

export const CreateTowerSchema = z.object({
  name: z.string().min(1).max(100),
});

// Parcel schemas
export const RegisterParcelSchema = z.object({
  courier: z.string().min(1).max(100),
  trackingNumber: z.string().min(1).max(100),
  unitId: z.string().uuid(),
  recipientName: z.string().max(100).optional(),
  storageLocationId: z.string().uuid(),
  idempotencyKey: z.string().min(1).max(100),
});

export const MoveStorageSchema = z.object({
  storageLocationId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

export const ReturnToCourierSchema = z.object({
  reason: z.string().min(1).max(500),
  courierPersonName: z.string().max(100).optional(),
});

// Scheduling schemas
export const BookSlotSchema = z.object({
  slotInstanceId: z.string().uuid(),
  deliveryNote: z.string().max(500).optional(),
  idempotencyKey: z.string().min(1).max(100),
});

export const RescheduleSchema = z.object({
  slotInstanceId: z.string().uuid(),
  deliveryNote: z.string().max(500).optional(),
  idempotencyKey: z.string().min(1).max(100),
});

// Task schemas
export const AssignTaskSchema = z.object({
  executiveId: z.string().uuid(),
});

export const FailDeliverySchema = z.object({
  reason: z.nativeEnum(FailureReason),
  note: z.string().max(500).optional(),
  storageLocationId: z.string().uuid(),
});

export const OverrideHandoverSchema = z.object({
  reason: z.string().min(1).max(500),
  receiverName: z.string().min(1).max(100),
  relationship: z.string().max(100).optional(),
  idempotencyKey: z.string().min(1).max(100),
});

export const VerifyOtpSchema = z.object({
  otp: z.string().length(6).regex(/^\d{6}$/),
  idempotencyKey: z.string().min(1).max(100),
});

// Storage location schemas
export const StorageLocationSchema = z.object({
  name: z.string().min(1).max(100),
  capacity: z.number().int().min(1).max(10000),
  active: z.boolean().default(true),
});

// Slot template schemas
export const SlotTemplateSchema = z.object({
  label: z.string().min(1).max(100),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/), // HH:MM
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  capacity: z.number().int().min(1).max(1000),
  activeWeekdays: z.array(z.number().int().min(0).max(6)), // 0=Sun, 6=Sat
  active: z.boolean().default(true),
});

// Invite schemas
export const CreateInviteSchema = z
  .object({
    targetEmail: z.string().email().optional(),
    targetPhone: z.string().optional(),
    roles: z.array(z.nativeEnum(UserRole)).min(1),
    unitId: z.string().uuid().optional(),
  })
  .refine((d) => d.targetEmail || d.targetPhone, { message: 'Either email or phone is required' });

// Pickup schemas
export const PickupRequestSchema = z.object({
  preferredTime: z.string().optional(),
  note: z.string().max(500).optional(),
});

export const CompletePickupSchema = z.object({
  verificationMethod: z.nativeEnum(VerificationMethod),
  otp: z.string().length(6).optional(),
  idempotencyKey: z.string().min(1).max(100),
});

// Device & Notification Schemas
export const RegisterDeviceSchema = z.object({
  platform: z.string().min(1).max(50),
  token: z.string().min(1).max(1000),
});

export const UpdateNotificationPreferencesSchema = z.object({
  category: z.nativeEnum(NotificationCategory),
  enabled: z.boolean(),
});

// Unit Import & Search Schemas
export const BulkImportUnitsSchema = z.object({
  units: z
    .array(
      z.object({
        towerName: z.string().min(1).max(100),
        floor: z.number().int().min(-5).max(200),
        unitNumber: z.string().min(1).max(20),
      })
    )
    .min(1)
    .max(2000),
});

// Slot Instance & Template Updates
export const UpdateSlotTemplateSchema = SlotTemplateSchema.partial();

export const UpdateSlotInstanceSchema = z.object({
  capacity: z.number().int().min(0).max(1000).optional(),
  status: z.nativeEnum(SlotInstanceStatus).optional(),
});


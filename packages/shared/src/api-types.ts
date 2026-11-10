import {
  ParcelStatus,
  UserRole,
  MemberStatus,
  UnitMembershipType,
  DeliveryScheduleStatus,
  TaskStatus,
  SlotInstanceStatus,
  NotificationCategory,
  SocietyStatus,
  AssignmentMode,
  PickupRequestStatus,
  OtpChallengeStatus,
  FulfillmentMode,
  ParcelClass,
} from './enums';

// API Error format
export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  cursor?: string;
  hasMore: boolean;
  total?: number;
}

// Society
export interface SocietyDto {
  id: string;
  name: string;
  address: string;
  timezone: string;
  status: SocietyStatus;
  settings: SocietySettingsDto;
  createdAt: string;
}

export interface SocietySettingsDto {
  slotCutoffHours: number;
  schedulingHorizonDays: number;
  unclaimedThresholdDays: number;
  photoRequired: boolean;
  otpExpiryMinutes: number;
  maxFailedAttempts: number;
  assignmentMode: AssignmentMode;
  fulfillmentMode?: FulfillmentMode;
}

// User / Auth
export interface UserDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  memberships: MembershipDto[];
}

export interface MembershipDto {
  societyId: string;
  societyName: string;
  roles: UserRole[];
  status: MemberStatus;
  units: UnitSummaryDto[];
}

export interface AuthResponse {
  user: UserDto;
  accessToken: string;
}

// Tower / Unit
export interface TowerDto {
  id: string;
  name: string;
  societyId: string;
}

export interface UnitDto {
  id: string;
  societyId: string;
  tower: TowerDto;
  floor: number;
  unitNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
  members?: UnitMemberDto[];
}

export interface UnitSummaryDto {
  id: string;
  tower: string;
  floor: number;
  unitNumber: string;
}

export interface UnitMemberDto {
  userId: string;
  name: string;
  type: UnitMembershipType;
  status: string;
}

// Parcel
export interface ParcelDto {
  id: string;
  societyId: string;
  parcelCode: string;
  qrToken?: string;
  courier: string;
  trackingNumber: string;
  unit: UnitSummaryDto;
  recipientName?: string;
  receivedBy: string;
  receivedAt: string;
  storageLocation?: StorageLocationDto;
  photoUrl?: string;
  status: ParcelStatus;
  statusUpdatedAt: string;
  failedAttemptCount: number;
  schedule?: DeliveryScheduleDto;
  notes?: string;
  parcelClass?: ParcelClass;
  version: number;
}

export interface ParcelTimelineEvent {
  id: string;
  eventType: string;
  actorName: string;
  actorRole: string;
  previousStatus?: ParcelStatus;
  newStatus?: ParcelStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  flagged?: boolean;
}

// Storage
export interface StorageLocationDto {
  id: string;
  name: string;
  capacity: number;
  occupancy: number;
  active: boolean;
}

// Slot
export interface SlotTemplateDto {
  id: string;
  societyId: string;
  label: string;
  startTime: string;
  endTime: string;
  capacity: number;
  activeWeekdays: number[];
  active: boolean;
}

export interface SlotInstanceDto {
  id: string;
  templateId: string;
  label: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  remainingCapacity: number;
  status: SlotInstanceStatus;
}

// Schedule
export interface DeliveryScheduleDto {
  id: string;
  parcelId: string;
  slotInstance: SlotInstanceDto;
  status: DeliveryScheduleStatus;
  deliveryNote?: string;
  createdAt: string;
}

// Task
export interface DeliveryTaskDto {
  id: string;
  scheduleId: string;
  parcel: ParcelDto;
  assignedExecutive?: { id: string; name: string };
  status: TaskStatus;
  window: { start: string; end: string };
  unit: UnitSummaryDto;
}

// Notifications
export interface NotificationDto {
  id: string;
  type: NotificationCategory;
  title: string;
  message: string;
  relatedParcelId?: string;
  read: boolean;
  createdAt: string;
}

// Invite / Join Request
export interface InviteDto {
  id: string;
  targetEmail?: string;
  targetPhone?: string;
  roles: UserRole[];
  unit?: UnitSummaryDto;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface JoinRequestDto {
  id: string;
  user: { id: string; name: string; email?: string; phone?: string };
  unit: UnitSummaryDto;
  relationship: UnitMembershipType;
  status: string;
  createdAt: string;
}

// Reports / Dashboard
export interface DashboardMetricsDto {
  receivedToday: number;
  awaitingScheduling: number;
  scheduledToday: number;
  outForDelivery: number;
  deliveredToday: number;
  failedOrDelayed: number;
  storageOccupancy: { used: number; total: number };
  onTimeRate: number;
  avgHandlingTimeMinutes: number;
}

// OTP
export interface OtpResponse {
  code: string;
  expiresAt: string;
  attemptsRemaining: number;
}

// Smart Parcel Consolidation (Roadmap P0)
export interface ConsolidatedBookingDto {
  scheduleIds: string[];
  taskIds: string[];
  parcelIds: string[];
  slotInstanceId: string;
  deliveryDate: string;
  deliveryWindow: string;
  consolidatedCount: number;
}

// Intelligent Scheduling Recommendation (Roadmap P1)
export interface SlotRecommendationDto {
  slot: SlotInstanceDto;
  score: number;
  recommended: boolean;
  reasons: string[];
}

// Hybrid Fulfillment: Self-Pickup Request (Roadmap P0)
export interface SelfPickupRequestDto {
  id: string;
  parcelId: string;
  requestedById: string;
  status: PickupRequestStatus;
  authorizedReceiverName?: string;
  note?: string;
  createdAt: string;
}

// Pilot Operational KPIs (Roadmap Section 10 & P1)
export interface PilotKpisDto {
  checkInTimeSecs: number;
  avgStorageDwellHours: number;
  firstAttemptSuccessRate: number;
  consolidationRate: number;
  disputeRatePer1000: number;
  activeParcelsCount: number;
  ageingParcelsCount: number;
  totalParcelsCount: number;
}


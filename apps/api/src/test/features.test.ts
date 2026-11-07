import { describe, it, expect } from 'vitest';
import {
  BulkImportUnitsSchema,
  RegisterDeviceSchema,
  UpdateNotificationPreferencesSchema,
  UpdateSlotInstanceSchema,
  UpdateSlotTemplateSchema,
  NotificationCategory,
  SlotInstanceStatus,
} from '@parceltime/shared';

describe('New Platform Features & Schemas', () => {
  it('validates BulkImportUnitsSchema with valid units', () => {
    const validData = {
      units: [
        { towerName: 'Tower A', floor: 4, unitNumber: '401' },
        { towerName: 'Tower A', floor: 4, unitNumber: '402' },
        { towerName: 'Tower B', floor: 12, unitNumber: '1205' },
      ],
    };
    const parsed = BulkImportUnitsSchema.parse(validData);
    expect(parsed.units).toHaveLength(3);
    expect(parsed.units[0].unitNumber).toBe('401');
  });

  it('rejects BulkImportUnitsSchema with empty unit list', () => {
    expect(() => BulkImportUnitsSchema.parse({ units: [] })).toThrow();
  });

  it('validates RegisterDeviceSchema', () => {
    const validDevice = {
      platform: 'android',
      token: 'fcm_token_xyz_8901234567890',
    };
    const parsed = RegisterDeviceSchema.parse(validDevice);
    expect(parsed.platform).toBe('android');
    expect(parsed.token).toBe('fcm_token_xyz_8901234567890');
  });

  it('validates UpdateNotificationPreferencesSchema', () => {
    const validPref = {
      category: NotificationCategory.SCHEDULE_CHANGED,
      enabled: false,
    };
    const parsed = UpdateNotificationPreferencesSchema.parse(validPref);
    expect(parsed.category).toBe(NotificationCategory.SCHEDULE_CHANGED);
    expect(parsed.enabled).toBe(false);
  });

  it('validates UpdateSlotInstanceSchema for capacity override and blocking', () => {
    const override = {
      capacity: 15,
      status: SlotInstanceStatus.BLOCKED,
    };
    const parsed = UpdateSlotInstanceSchema.parse(override);
    expect(parsed.capacity).toBe(15);
    expect(parsed.status).toBe(SlotInstanceStatus.BLOCKED);
  });

  it('validates UpdateSlotTemplateSchema partial updates', () => {
    const partialUpdate = {
      capacity: 25,
      active: false,
    };
    const parsed = UpdateSlotTemplateSchema.parse(partialUpdate);
    expect(parsed.capacity).toBe(25);
    expect(parsed.active).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import {
  VerifyOtpSchema,
  RegisterParcelSchema,
  BookSlotSchema,
  CreateSocietySchema,
} from '@parceltime/shared';

describe('Validation Schemas', () => {
  it('validates 6-digit OTP schema correctly', () => {
    expect(() =>
      VerifyOtpSchema.parse({ otp: '482910', idempotencyKey: 'key-1' })
    ).not.toThrow();

    // Invalid length
    expect(() =>
      VerifyOtpSchema.parse({ otp: '48291', idempotencyKey: 'key-1' })
    ).toThrow();

    // Non-numeric
    expect(() =>
      VerifyOtpSchema.parse({ otp: 'ABCDEF', idempotencyKey: 'key-1' })
    ).toThrow();
  });

  it('validates parcel registration schema', () => {
    const validData = {
      courier: 'Amazon Logistics',
      trackingNumber: 'AZ-12345678',
      unitId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      recipientName: 'Priya Sharma',
      storageLocationId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      idempotencyKey: 'idemp-1',
    };
    expect(() => RegisterParcelSchema.parse(validData)).not.toThrow();

    // Missing courier
    expect(() =>
      RegisterParcelSchema.parse({ ...validData, courier: '' })
    ).toThrow();

    // Invalid UUID
    expect(() =>
      RegisterParcelSchema.parse({ ...validData, unitId: 'invalid-id' })
    ).toThrow();
  });

  it('validates slot booking schema', () => {
    expect(() =>
      BookSlotSchema.parse({
        slotInstanceId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        deliveryNote: 'Ring doorbell twice',
        idempotencyKey: 'book-1',
      })
    ).not.toThrow();
  });
});


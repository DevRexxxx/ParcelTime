import { describe, it, expect } from 'vitest';
import { canTransition } from '../modules/parcels/parcel.service';
import { ParcelStatus } from '@parceltime/shared';

describe('Parcel State Machine Transitions', () => {
  it('allows valid transitions from RECEIVED', () => {
    expect(canTransition(ParcelStatus.RECEIVED, ParcelStatus.SCHEDULED)).toBe(true);
    expect(canTransition(ParcelStatus.RECEIVED, ParcelStatus.CANCELLED)).toBe(true);
  });

  it('allows valid transitions from SCHEDULED', () => {
    expect(canTransition(ParcelStatus.SCHEDULED, ParcelStatus.ASSIGNED)).toBe(true);
    expect(canTransition(ParcelStatus.SCHEDULED, ParcelStatus.RECEIVED)).toBe(true);
  });

  it('allows valid transitions from ASSIGNED', () => {
    expect(canTransition(ParcelStatus.ASSIGNED, ParcelStatus.OUT_FOR_DELIVERY)).toBe(true);
    expect(canTransition(ParcelStatus.ASSIGNED, ParcelStatus.SCHEDULED)).toBe(true);
  });

  it('allows terminal transition from OUT_FOR_DELIVERY to DELIVERED', () => {
    expect(canTransition(ParcelStatus.OUT_FOR_DELIVERY, ParcelStatus.DELIVERED)).toBe(true);
  });

  it('rejects illegal transitions', () => {
    expect(canTransition(ParcelStatus.DELIVERED, ParcelStatus.RECEIVED)).toBe(false);
    expect(canTransition(ParcelStatus.RECEIVED, ParcelStatus.DELIVERED)).toBe(false);
    expect(canTransition(ParcelStatus.RECEIVED, ParcelStatus.OUT_FOR_DELIVERY)).toBe(false);
    expect(canTransition(ParcelStatus.CANCELLED, ParcelStatus.DELIVERED)).toBe(false);
    expect(canTransition(ParcelStatus.RETURNED_TO_COURIER, ParcelStatus.RECEIVED)).toBe(false);
  });
});

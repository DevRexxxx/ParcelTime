import { describe, it, expect } from 'vitest';
import { hashOtp } from '../modules/tasks/task.service';

describe('Handover OTP Security & Hashing', () => {
  it('generates consistent deterministic hashes for parcelId + otp', () => {
    const parcelId = 'parcel-uuid-123';
    const otp = '482910';

    const hash1 = hashOtp(parcelId, otp);
    const hash2 = hashOtp(parcelId, otp);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex
  });

  it('generates different hashes for different parcels with same OTP', () => {
    const otp = '123456';
    const hashA = hashOtp('parcel-A', otp);
    const hashB = hashOtp('parcel-B', otp);

    expect(hashA).not.toBe(hashB);
  });

  it('generates different hashes for different OTPs on same parcel', () => {
    const parcelId = 'parcel-1';
    const hash1 = hashOtp(parcelId, '111111');
    const hash2 = hashOtp(parcelId, '222222');

    expect(hash1).not.toBe(hash2);
  });
});

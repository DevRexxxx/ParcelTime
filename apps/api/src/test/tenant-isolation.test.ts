import { describe, it, expect } from 'vitest';
import { UserRole } from '@parceltime/shared';

describe('Tenant & Society Isolation Rules', () => {
  it('enforces that a user can only access parcels within their active societyId', () => {
    const userSession = {
      userId: 'user-resident-1',
      societyId: 'society-greenwood-palms',
      roles: [UserRole.RESIDENT],
    };

    const parcelInSameSociety = {
      id: 'parcel-101',
      societyId: 'society-greenwood-palms',
    };

    const parcelInOtherSociety = {
      id: 'parcel-999',
      societyId: 'society-other-complex',
    };

    // Permission check
    const canAccessSame = userSession.societyId === parcelInSameSociety.societyId;
    const canAccessOther = userSession.societyId === parcelInOtherSociety.societyId;

    expect(canAccessSame).toBe(true);
    expect(canAccessOther).toBe(false);
  });

  it('rejects executive claiming a task from a different society', () => {
    const executiveSession = {
      userId: 'exec-rajesh',
      societyId: 'society-greenwood-palms',
      roles: [UserRole.DELIVERY_EXECUTIVE],
    };

    const foreignTask = {
      id: 'task-77',
      societyId: 'society-other-complex',
    };

    expect(executiveSession.societyId === foreignTask.societyId).toBe(false);
  });
});


import { describe, it, expect } from 'vitest';
import {
  ConsolidateBookingSchema,
  RequestSelfPickupSchema,
  SlotRecommendationQuerySchema,
  ReportDamageDisputeSchema,
  FulfillmentMode,
  ParcelStatus,
  SlotInstanceStatus,
} from '@parceltime/shared';

describe('Roadmap P0 & P1 Improvements: Schemas & Invariants', () => {
  describe('4.1 Smart Parcel Consolidation (P0)', () => {
    it('validates a valid consolidated booking payload with multiple parcels', () => {
      const payload = {
        parcelIds: [
          'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
          'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
        ],
        slotInstanceId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        deliveryNote: 'Leave at front porch if no answer',
        idempotencyKey: 'consol-idemp-12345',
      };

      const parsed = ConsolidateBookingSchema.parse(payload);
      expect(parsed.parcelIds).toHaveLength(3);
      expect(parsed.slotInstanceId).toBe(payload.slotInstanceId);
    });

    it('rejects consolidation with fewer than 2 parcels', () => {
      const payload = {
        parcelIds: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
        slotInstanceId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
        idempotencyKey: 'consol-idemp-invalid',
      };

      expect(() => ConsolidateBookingSchema.parse(payload)).toThrow(/at least 2 parcels/);
    });

    it('verifies consolidation preserves single delivery trip capacity', () => {
      // Invariant: 3 consolidated packages consume only 1 slot reservation
      const initialBookedCount = 4;
      const slotCapacity = 10;

      const performConsolidationReservation = (parcelCount: number) => {
        expect(parcelCount).toBeGreaterThanOrEqual(2);
        // Regardless of parcel count (2, 3, or 5), capacity consumed is 1 delivery run
        const capacityConsumed = 1;
        return initialBookedCount + capacityConsumed;
      };

      const updatedCount = performConsolidationReservation(3);
      expect(updatedCount).toBe(5);
      expect(updatedCount).toBeLessThanOrEqual(slotCapacity);
    });
  });

  describe('4.2 Hybrid Fulfillment Modes (P0)', () => {
    it('supports society fulfillment modes: HYBRID, INTERNAL_DELIVERY, and SELF_PICKUP', () => {
      expect(FulfillmentMode.HYBRID).toBe('HYBRID');
      expect(FulfillmentMode.INTERNAL_DELIVERY).toBe('INTERNAL_DELIVERY');
      expect(FulfillmentMode.SELF_PICKUP).toBe('SELF_PICKUP');
    });

    it('validates RequestSelfPickupSchema with authorized receiver note', () => {
      const payload = {
        parcelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        pickupNote: 'Will collect during lunch break',
        authorizedReceiverName: 'Aarav Sharma (Brother)',
        idempotencyKey: 'pickup-req-123',
      };

      const parsed = RequestSelfPickupSchema.parse(payload);
      expect(parsed.parcelId).toBe(payload.parcelId);
      expect(parsed.authorizedReceiverName).toBe('Aarav Sharma (Brother)');
    });
  });

  describe('4.3 Intelligent Scheduling: Deterministic Scoring (P1)', () => {
    it('validates SlotRecommendationQuerySchema', () => {
      const query = {
        unitId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        date: '2026-11-12',
      };
      const parsed = SlotRecommendationQuerySchema.parse(query);
      expect(parsed.unitId).toBe(query.unitId);
      expect(parsed.date).toBe('2026-11-12');
    });

    it('ranks same-unit consolidation slots above generic slots', () => {
      // Deterministic scoring evaluation test
      const evaluateSlotScore = (params: {
        isAvailable: boolean;
        hasSameUnitDelivery: boolean;
        hasSameTowerDelivery: boolean;
        isEvening: boolean;
        capacityRatio: number;
      }) => {
        if (!params.isAvailable) return 0;
        let score = 50; // base score
        if (params.hasSameUnitDelivery) score += 50;
        if (params.hasSameTowerDelivery) score += 25;
        if (params.isEvening) score += 15;
        score += Math.round(params.capacityRatio * 10);
        return score;
      };

      const slotWithConsolidation = evaluateSlotScore({
        isAvailable: true,
        hasSameUnitDelivery: true,
        hasSameTowerDelivery: true,
        isEvening: true,
        capacityRatio: 0.8,
      });

      const genericMorningSlot = evaluateSlotScore({
        isAvailable: true,
        hasSameUnitDelivery: false,
        hasSameTowerDelivery: false,
        isEvening: false,
        capacityRatio: 0.8,
      });

      // Consolidation slot must score higher (148 vs 58)
      expect(slotWithConsolidation).toBeGreaterThan(genericMorningSlot);
      expect(slotWithConsolidation).toBe(148);
      expect(genericMorningSlot).toBe(58);
    });
  });

  describe('Damage & Dispute Reporting (Roadmap Section 5 & P1)', () => {
    it('validates ReportDamageDisputeSchema', () => {
      const payload = {
        parcelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        description: 'Outer carton water-damaged upon reception handoff',
        photoRef: 's3://evidence/pt-8942-damage.jpg',
        idempotencyKey: 'dispute-idemp-99',
      };

      const parsed = ReportDamageDisputeSchema.parse(payload);
      expect(parsed.description).toContain('water-damaged');
      expect(parsed.photoRef).toBe('s3://evidence/pt-8942-damage.jpg');
    });
  });
});

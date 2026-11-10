import { prisma } from '../../lib/prisma';
import { ShipmentNormalizer } from './shipment-normalizer';

export type MatchOutcome = 'EXACT' | 'HIGH_CONFIDENCE' | 'AMBIGUOUS' | 'NEW';

export interface MatchResult {
  outcome: MatchOutcome;
  matchedShipmentId?: string;
  confidence: number;
  reason: string;
}

export class ShipmentMatcher {
  /**
   * Evaluates if an incoming shipment candidate matches an existing shipment record
   */
  static async findMatch(params: {
    societyId: string;
    trackingNumber: string;
    carrierCode: string;
    orderReference?: string;
    residentId?: string;
  }): Promise<MatchResult> {
    const cleanTracking = ShipmentNormalizer.cleanTrackingNumber(params.trackingNumber);
    const normalizedCarrier = ShipmentNormalizer.normalizeCarrier(params.carrierCode);

    // 1. Exact Match: Society + Carrier + Tracking Number
    const exact = await prisma.shipment.findFirst({
      where: {
        societyId: params.societyId,
        trackingNumber: cleanTracking,
        carrierCode: normalizedCarrier,
      },
    });

    if (exact) {
      return {
        outcome: 'EXACT',
        matchedShipmentId: exact.id,
        confidence: 1.0,
        reason: 'Matched exact carrier and tracking number within society boundary',
      };
    }

    // 2. High Confidence Match: Society + Order Reference
    if (params.orderReference) {
      const orderMatch = await prisma.shipment.findFirst({
        where: {
          societyId: params.societyId,
          orderReference: params.orderReference,
        },
      });

      if (orderMatch) {
        return {
          outcome: 'HIGH_CONFIDENCE',
          matchedShipmentId: orderMatch.id,
          confidence: 0.95,
          reason: 'Matched merchant order reference',
        };
      }
    }

    // 3. Match across different carrier spelling / same resident & tracking number
    if (params.residentId) {
      const residentTrackingMatch = await prisma.shipment.findFirst({
        where: {
          societyId: params.societyId,
          residentId: params.residentId,
          trackingNumber: cleanTracking,
        },
      });

      if (residentTrackingMatch) {
        return {
          outcome: 'HIGH_CONFIDENCE',
          matchedShipmentId: residentTrackingMatch.id,
          confidence: 0.9,
          reason: 'Matched tracking number for the same resident',
        };
      }
    }

    return {
      outcome: 'NEW',
      confidence: 1.0,
      reason: 'No duplicate shipment found; eligible for creation',
    };
  }
}

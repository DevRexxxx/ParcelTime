import { prisma } from '../../lib/prisma';
import { ShipmentNormalizer } from './shipment-normalizer';

export type MatchOutcome = 'EXACT' | 'HIGH_CONFIDENCE' | 'AMBIGUOUS' | 'NEW' | 'CONFLICT';

export interface MatchResult {
  outcome: MatchOutcome;
  matchedShipmentId?: string;
  confidence: number;
  reason: string;
}

export class ShipmentMatcher {
  /**
   * Evaluates if an incoming shipment candidate matches an existing shipment record.
   * Enforces cross-resident conflict protection, carrier aliasing, and source-reference lookups (§10 & §14).
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
    const cleanOrderRef = params.orderReference?.trim() || undefined;

    // 1. Primary Invariant: Physical Tracking Number within Society Boundary
    // Any parcel in the same society with this tracking number represents the exact same physical delivery
    const existingTracking = await prisma.shipment.findFirst({
      where: {
        societyId: params.societyId,
        trackingNumber: cleanTracking,
      },
    });

    if (existingTracking) {
      // Cross-resident conflict protection (§10 & §14)
      if (params.residentId && existingTracking.residentId !== params.residentId) {
        return {
          outcome: 'CONFLICT',
          matchedShipmentId: existingTracking.id,
          confidence: 0.5,
          reason: 'Tracking number is already registered to another resident in this society',
        };
      }

      const isExactCarrier = existingTracking.carrierCode === normalizedCarrier;
      return {
        outcome: isExactCarrier ? 'EXACT' : 'HIGH_CONFIDENCE',
        matchedShipmentId: existingTracking.id,
        confidence: isExactCarrier ? 1.0 : 0.95,
        reason: isExactCarrier
          ? 'Matched exact carrier and tracking number within society boundary'
          : `Matched tracking number for resident with carrier alias (${existingTracking.carrierCode} vs ${normalizedCarrier})`,
      };
    }

    // 2. High Confidence Match: Society + Order Reference on Shipment table
    if (cleanOrderRef) {
      const orderMatch = await prisma.shipment.findFirst({
        where: {
          societyId: params.societyId,
          orderReference: {
            equals: cleanOrderRef,
            mode: 'insensitive',
          },
        },
      });

      if (orderMatch) {
        if (params.residentId && orderMatch.residentId !== params.residentId) {
          return {
            outcome: 'CONFLICT',
            matchedShipmentId: orderMatch.id,
            confidence: 0.5,
            reason: 'Order reference is already registered to another resident in this society',
          };
        }

        return {
          outcome: 'HIGH_CONFIDENCE',
          matchedShipmentId: orderMatch.id,
          confidence: 0.95,
          reason: 'Matched merchant order reference',
        };
      }

      // 3. Match against ShipmentSourceReference table (e.g. Gmail discovery IDs, marketplace refs)
      const sourceRefMatch = await prisma.shipmentSourceReference.findFirst({
        where: {
          externalReference: cleanOrderRef,
          shipment: {
            societyId: params.societyId,
          },
        },
        include: {
          shipment: true,
        },
      });

      if (sourceRefMatch?.shipment) {
        if (params.residentId && sourceRefMatch.shipment.residentId !== params.residentId) {
          return {
            outcome: 'CONFLICT',
            matchedShipmentId: sourceRefMatch.shipment.id,
            confidence: 0.5,
            reason: 'Order reference is already registered to another resident in this society',
          };
        }

        return {
          outcome: 'HIGH_CONFIDENCE',
          matchedShipmentId: sourceRefMatch.shipment.id,
          confidence: 0.90,
          reason: 'Matched historical source reference in society',
        };
      }
    }

    // 4. Match via resident + tracking number
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



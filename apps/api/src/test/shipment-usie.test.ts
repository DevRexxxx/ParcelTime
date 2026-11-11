import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'crypto';
import {
  ShipmentExternalStatus,
  CanonicalCarrier,
  CreateManualShipmentSchema,
  ConnectIntegrationSchema,
  ShipmentWebhookPayloadSchema,
} from '@parceltime/shared';
import { AftershipAdapter } from '../integrations/tracking/aftership.adapter';
import { ShiprocketAdapter } from '../integrations/tracking/shiprocket.adapter';
import { GmailParser } from '../integrations/gmail/gmail.parser';
import { ShipmentNormalizer } from '../modules/shipments/shipment-normalizer';
import { ShipmentMatcher } from '../modules/shipments/shipment-matcher';
import { ShipmentService } from '../modules/shipments/shipment.service';
import { prisma } from '../lib/prisma';

describe('Live Shipment Integration Architecture (USIE)', () => {
  describe('1. Tracking Provider Adapters & Webhook Security', () => {
    it('verifies valid HMAC-SHA256 signature for AfterShip webhooks', async () => {
      const secret = 'aftership_test_secret_123';
      const adapter = new AftershipAdapter(secret);
      const payload = JSON.stringify({
        event_id: 'evt_99182',
        msg: {
          tracking_number: '140928192019',
          slug: 'delhivery',
          tag: 'InTransit',
        },
      });

      const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64');
      const isValid = await adapter.verifyWebhook(payload, {
        'aftership-hmac-sha256': signature,
      });

      expect(isValid).toBe(true);
    });

    it('rejects tampered or forged AfterShip webhook signatures', async () => {
      const adapter = new AftershipAdapter('correct_secret');
      const payload = JSON.stringify({ tracking_number: '140928192019' });
      const badSignature = 'forged_base64_signature_value';

      const isValid = await adapter.verifyWebhook(payload, {
        'aftership-hmac-sha256': badSignature,
      });

      expect(isValid).toBe(false);
    });

    it('enforces External Delivery Invariant: courier delivered means DELIVERED_TO_SOCIETY, NOT resident handover', async () => {
      const adapter = new AftershipAdapter();
      const payload = {
        msg: {
          tracking_number: '140928192019',
          slug: 'delhivery',
          tag: 'Delivered',
          subtag_message: 'Package handed over at security guard desk',
        },
      };

      const normalized = await adapter.normalizeWebhook(payload);
      expect(normalized.events[0].status).toBe(ShipmentExternalStatus.DELIVERED_TO_SOCIETY);
      expect(normalized.events[0].status).not.toBe('DELIVERED_TO_RESIDENT');
    });

    it('normalizes Shiprocket domestic Indian logistics webhooks', async () => {
      const adapter = new ShiprocketAdapter();
      const payload = {
        awb: '7492018491',
        courier_name: 'Blue Dart',
        current_status: 'OUT FOR DELIVERY',
        activity: 'Out with delivery executive for gate delivery',
        etd: '2026-11-12T18:00:00.000Z',
      };

      const normalized = await adapter.normalizeWebhook(payload);
      expect(normalized.trackingNumber).toBe('7492018491');
      expect(normalized.events[0].status).toBe(ShipmentExternalStatus.OUT_FOR_DELIVERY);
      expect(normalized.estimatedDeliveryAt).toBe('2026-11-12T18:00:00.000Z');
    });
  });

  describe('2. Gmail Email Discovery & Deterministic Parser', () => {
    it('accurately parses Amazon India dispatch emails', () => {
      const email = {
        from: 'ship-confirm@amazon.in',
        subject: 'Dispatched: Your Amazon.in order #408-7291038-1928401',
        snippet: 'Your package is on its way. Track with Delhivery.',
        body: 'Hello Priya, your package was shipped with Delhivery (Tracking ID: 140928192019). Arriving tomorrow by 8 PM.',
      };

      const parsed = GmailParser.parseEmail(email);
      expect(parsed).not.toBeNull();
      expect(parsed?.merchantName).toBe('Amazon India');
      expect(parsed?.orderReference).toBe('408-7291038-1928401');
      expect(parsed?.trackingNumber).toBe('140928192019');
      expect(parsed?.carrierCode).toBe(CanonicalCarrier.DELHIVERY);
      expect(parsed?.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('accurately parses Flipkart Ekart dispatch emails', () => {
      const email = {
        from: 'updates@flipkart.com',
        subject: 'Your Flipkart order OD1928374650192837 has been shipped!',
        snippet: 'Shipped via Ekart Logistics with tracking number FMPC012345678',
        body: 'Track your item anytime. Your Ekart tracking ID is FMPC012345678.',
      };

      const parsed = GmailParser.parseEmail(email);
      expect(parsed).not.toBeNull();
      expect(parsed?.merchantName).toBe('Flipkart');
      expect(parsed?.orderReference).toBe('OD1928374650192837');
      expect(parsed?.trackingNumber).toBe('FMPC012345678');
      expect(parsed?.carrierCode).toBe(CanonicalCarrier.EKART);
    });

    it('returns null for non-shipping / marketing emails', () => {
      const email = {
        from: 'offers@newsletter.com',
        subject: '50% off this weekend on all home items!',
        body: 'Check out our new catalog and save big today.',
      };

      const parsed = GmailParser.parseEmail(email);
      expect(parsed).toBeNull();
    });
  });

  describe('3. Shipment Normalization & Sanitation', () => {
    it('cleans tracking numbers removing spaces, dashes, and hashes', () => {
      expect(ShipmentNormalizer.cleanTrackingNumber('  1409-2819-2019 # ')).toBe('140928192019');
      expect(ShipmentNormalizer.cleanTrackingNumber('fmpc 0123 45678')).toBe('FMPC012345678');
      expect(ShipmentNormalizer.cleanTrackingNumber('BLUEDART: 99182310')).toBe('BLUEDART99182310');
    });

    it('maps carrier variations to CanonicalCarrier enum', () => {
      expect(ShipmentNormalizer.normalizeCarrier('Delhivery Surface Express')).toBe(CanonicalCarrier.DELHIVERY);
      expect(ShipmentNormalizer.normalizeCarrier('Blue Dart Express Ltd')).toBe(CanonicalCarrier.BLUEDART);
      expect(ShipmentNormalizer.normalizeCarrier('Ekart Logistics')).toBe(CanonicalCarrier.EKART);
      expect(ShipmentNormalizer.normalizeCarrier('Amazon Shipping')).toBe(CanonicalCarrier.AMAZON_LOGISTICS);
      expect(ShipmentNormalizer.normalizeCarrier('India Post Speed Post')).toBe(CanonicalCarrier.INDIA_POST);
    });
  });

  describe('4. Shared USIE Schemas & Validations', () => {
    it('validates manual shipment creation schema', () => {
      const payload = {
        trackingNumber: '140928192019',
        carrierCode: 'DELHIVERY',
        orderReference: '408-7291038-1928401',
        merchantName: 'Amazon India',
        estimatedDeliveryAt: '2026-11-12T14:00:00.000Z',
        sourceType: 'MANUAL' as const,
      };

      const parsed = CreateManualShipmentSchema.parse(payload);
      expect(parsed.trackingNumber).toBe(payload.trackingNumber);
      expect(parsed.carrierCode).toBe(payload.carrierCode);
    });

    it('validates Gmail integration connection schema', () => {
      const payload = {
        provider: 'GMAIL' as const,
        authCode: '4/0AY0e-gtest_oauth_code_abc123',
        redirectUri: 'https://parceltimeweb-production.up.railway.app/auth/google/callback',
      };

      const parsed = ConnectIntegrationSchema.parse(payload);
      expect(parsed.provider).toBe('GMAIL');
      expect(parsed.authCode).toBe(payload.authCode);
    });

    it('validates tracking webhook payload schema', () => {
      const payload = {
        provider: 'AFTERSHIP',
        providerEventId: 'evt_88192',
        trackingNumber: '140928192019',
        carrierCode: 'delhivery',
        eventCode: 'InTransit',
        status: 'IN_TRANSIT',
        description: 'Departed Mumbai Sorting Facility',
        location: 'Mumbai Hub',
      };

      const parsed = ShipmentWebhookPayloadSchema.parse(payload);
      expect(parsed.provider).toBe('AFTERSHIP');
      expect(parsed.trackingNumber).toBe('140928192019');
    });
  });

  describe('5. Cross-Resident Conflict Detection & Invariant Protection (§10 & §14)', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns EXACT match when tracking belongs to the same resident', async () => {
      vi.spyOn(prisma.shipment, 'findFirst').mockResolvedValueOnce({
        id: 'shipment-100',
        residentId: 'resident-user-1',
        societyId: 'society-a',
        trackingNumber: '140928192019',
        carrierCode: 'DELHIVERY',
      } as any);

      const result = await ShipmentMatcher.findMatch({
        societyId: 'society-a',
        trackingNumber: '140928192019',
        carrierCode: 'DELHIVERY',
        residentId: 'resident-user-1',
      });

      expect(result.outcome).toBe('EXACT');
      expect(result.matchedShipmentId).toBe('shipment-100');
    });

    it('detects CONFLICT when another resident enters an already registered tracking number', async () => {
      vi.spyOn(prisma.shipment, 'findFirst').mockResolvedValueOnce({
        id: 'shipment-100',
        residentId: 'resident-user-1', // Belongs to Resident 1
        societyId: 'society-a',
        trackingNumber: '140928192019',
      } as any);

      const result = await ShipmentMatcher.findMatch({
        societyId: 'society-a',
        trackingNumber: '140928192019',
        carrierCode: 'DELHIVERY',
        residentId: 'resident-user-2', // Resident 2 attempts to register same tracking
      });

      expect(result.outcome).toBe('CONFLICT');
      expect(result.reason).toContain('already registered to another resident');
    });

    it('detects CONFLICT when another resident enters an already registered order reference', async () => {
      // First findFirst on tracking number returns null
      vi.spyOn(prisma.shipment, 'findFirst')
        .mockResolvedValueOnce(null)
        // Second findFirst on orderReference returns shipment belonging to Resident 1
        .mockResolvedValueOnce({
          id: 'shipment-101',
          residentId: 'resident-user-1',
          societyId: 'society-a',
          orderReference: 'AMZ-991823',
        } as any);

      const result = await ShipmentMatcher.findMatch({
        societyId: 'society-a',
        trackingNumber: '9988776655',
        carrierCode: 'DELHIVERY',
        orderReference: 'AMZ-991823',
        residentId: 'resident-user-2',
      });

      expect(result.outcome).toBe('CONFLICT');
      expect(result.reason).toContain('Order reference is already registered');
    });

    it('detects CONFLICT even when another resident supplies a different or alias carrier code for the same tracking number', async () => {
      vi.spyOn(prisma.shipment, 'findFirst').mockResolvedValueOnce({
        id: 'shipment-100',
        residentId: 'resident-user-1', // Registered under Delhivery
        societyId: 'society-a',
        trackingNumber: '140928192019',
        carrierCode: 'DELHIVERY',
      } as any);

      // Resident 2 attempts to register same tracking number under "OTHER" or "UNKNOWN"
      const result = await ShipmentMatcher.findMatch({
        societyId: 'society-a',
        trackingNumber: '140928192019',
        carrierCode: 'OTHER',
        residentId: 'resident-user-2',
      });

      expect(result.outcome).toBe('CONFLICT');
      expect(result.reason).toContain('already registered to another resident');
    });

    it('detects CONFLICT through historical ShipmentSourceReference lookup', async () => {
      // Direct tracking lookup returns null
      vi.spyOn(prisma.shipment, 'findFirst')
        .mockResolvedValueOnce(null)
        // Direct shipment orderReference returns null
        .mockResolvedValueOnce(null);

      // Source reference matches historical Gmail / order ref belonging to Resident 1
      vi.spyOn(prisma.shipmentSourceReference, 'findFirst').mockResolvedValueOnce({
        id: 'ref-1',
        externalReference: 'AMZ-REF-999',
        shipment: {
          id: 'shipment-105',
          residentId: 'resident-user-1',
          societyId: 'society-a',
        },
      } as any);

      const result = await ShipmentMatcher.findMatch({
        societyId: 'society-a',
        trackingNumber: '8877665544',
        carrierCode: 'DELHIVERY',
        orderReference: 'AMZ-REF-999',
        residentId: 'resident-user-2',
      });

      expect(result.outcome).toBe('CONFLICT');
      expect(result.reason).toMatch(/already (registered|linked) to another resident/);
    });

    it('rejects manual shipment entry when tracking number has fewer than 4 alphanumeric characters', async () => {
      await expect(
        ShipmentService.createManualShipment('society-a', 'resident-user-1', {
          trackingNumber: ' -# ',
          carrierCode: 'DELHIVERY',
        })
      ).rejects.toThrow(/at least 4 alphanumeric characters/);
    });

    it('throws CONFLICT error (HTTP 409) when creating manual shipment colliding with another resident', async () => {
      vi.spyOn(prisma.unitMembership, 'findFirst').mockResolvedValueOnce({
        id: 'unit-member-1',
        userId: 'resident-user-2',
        unitId: 'unit-102',
        status: 'ACTIVE',
      } as any);

      vi.spyOn(ShipmentMatcher, 'findMatch').mockResolvedValueOnce({
        outcome: 'CONFLICT',
        matchedShipmentId: 'shipment-100',
        confidence: 0.5,
        reason: 'Tracking number is already registered to another resident in this society',
      });

      await expect(
        ShipmentService.createManualShipment('society-a', 'resident-user-2', {
          trackingNumber: '140928192019',
          carrierCode: 'DELHIVERY',
        })
      ).rejects.toThrow(/already registered to another resident/);
    });

    it('rejects matchShipmentToParcel if shipment is already matched to a different parcel', async () => {
      vi.spyOn(prisma.shipment, 'findUnique').mockResolvedValueOnce({
        id: 'shipment-1',
        societyId: 'society-a',
        matchedParcelId: 'existing-parcel-999',
      } as any);

      await expect(
        ShipmentService.matchShipmentToParcel('society-a', 'shipment-1', 'new-parcel-111', 'actor-1')
      ).rejects.toThrow(/already linked to another gate parcel/);
    });

    it('processes carrier webhook projection enforcing External Delivery Invariant and notifying resident', async () => {
      vi.spyOn(prisma.shipment, 'findMany').mockResolvedValueOnce([
        {
          id: 'shipment-1',
          societyId: 'society-a',
          residentId: 'resident-1',
          carrierCode: 'DELHIVERY',
          trackingNumber: '140928192019',
          externalStatus: 'IN_TRANSIT',
        } as any,
      ]);

      vi.spyOn(prisma, '$transaction').mockResolvedValueOnce([{}, {}]);
      vi.spyOn(prisma.notificationPreference, 'findUnique').mockResolvedValueOnce({ enabled: true } as any);
      vi.spyOn(prisma.notification, 'create').mockResolvedValueOnce({} as any);
      vi.spyOn(prisma.outboxEvent, 'create').mockResolvedValueOnce({} as any);

      const result = await ShipmentService.processCarrierWebhookUpdate({
        societyId: 'society-a',
        trackingNumber: '140928192019',
        status: 'DELIVERED',
        eventCode: 'DELIVERED',
        description: 'Delivered at security guard booth',
        location: 'Society Security Gate',
      });

      expect(result).not.toBeNull();
      expect(result?.projectedStatus).toBe(ShipmentExternalStatus.DELIVERED_TO_SOCIETY);
      expect(result?.projectedStatus).not.toBe('DELIVERED_TO_RESIDENT');
    });
  });
});



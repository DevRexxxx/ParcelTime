import { CanonicalCarrier } from '@parceltime/shared';

export interface ParsedEmailShipment {
  trackingNumber: string;
  carrierCode: CanonicalCarrier | string;
  merchantName?: string;
  orderReference?: string;
  estimatedDeliveryAt?: string;
  confidence: number;
}

export class GmailParser {
  /**
   * Deterministically extract shipment signals from email metadata & body
   */
  static parseEmail(params: {
    subject: string;
    from: string;
    body: string;
    snippet?: string;
  }): ParsedEmailShipment | null {
    const text = `${params.subject}\n${params.snippet || ''}\n${params.body}`;

    let merchantName: string | undefined;
    let orderReference: string | undefined;
    let carrierCode: CanonicalCarrier | string = CanonicalCarrier.OTHER;
    let trackingNumber: string | undefined;
    let confidence = 0.5;

    // 1. Identify Merchant
    if (/amazon\.in|amazon/i.test(params.from) || /amazon/i.test(params.subject)) {
      merchantName = 'Amazon India';
      confidence += 0.2;
      const orderMatch = text.match(/(?:order\s*#?|#)\s*([0-9]{3}-[0-9]{7}-[0-9]{7})/i);
      if (orderMatch) orderReference = orderMatch[1];
    } else if (/flipkart/i.test(params.from) || /flipkart/i.test(params.subject)) {
      merchantName = 'Flipkart';
      confidence += 0.2;
      const orderMatch = text.match(/(?:order\s*#?|#)\s*(OD[0-9]{16,20})/i);
      if (orderMatch) orderReference = orderMatch[1];
    } else if (/myntra/i.test(params.from) || /myntra/i.test(params.subject)) {
      merchantName = 'Myntra';
      confidence += 0.15;
    } else if (/meesho/i.test(params.from) || /meesho/i.test(params.subject)) {
      merchantName = 'Meesho';
      confidence += 0.15;
    }

    // 2. Identify Carrier and Tracking Number
    // Ekart
    const ekartMatch = text.match(/(?:Ekart|FMPC)[^\w]*([A-Z]{3,4}[0-9]{8,14})/i) ||
      text.match(/\b(FMPC[0-9]{9,12})\b/i);
    if (ekartMatch) {
      trackingNumber = ekartMatch[1];
      carrierCode = CanonicalCarrier.EKART;
      confidence += 0.3;
    }

    // Delhivery
    if (!trackingNumber) {
      const delhiveryMatch = text.match(/(?:Delhivery)[^\w]*([0-9]{12,14})/i) ||
        text.match(/\b((?:14|31|18)[0-9]{10,12})\b/);
      if (delhiveryMatch && (/delhivery/i.test(text) || delhiveryMatch[0].length >= 12)) {
        trackingNumber = delhiveryMatch[1];
        carrierCode = CanonicalCarrier.DELHIVERY;
        confidence += 0.3;
      }
    }

    // Blue Dart
    if (!trackingNumber && /blue\s*dart/i.test(text)) {
      const bluedartMatch = text.match(/(?:waybill|tracking\s*(?:no|id|number)?|awb)[^\w]*([0-9]{9,11})/i) ||
        text.match(/\b([0-9]{9,11})\b/);
      if (bluedartMatch) {
        trackingNumber = bluedartMatch[1];
        carrierCode = CanonicalCarrier.BLUEDART;
        confidence += 0.3;
      }
    }

    // Amazon Shipping
    if (!trackingNumber && /amazon\s*shipping|amazon\s*logistics/i.test(text)) {
      const amznMatch = text.match(/\b(APWA[0-9]{8,12})\b/i) ||
        text.match(/(?:tracking\s*(?:id|number)?)[^\w]*([A-Z0-9]{10,16})/i);
      if (amznMatch) {
        trackingNumber = amznMatch[1];
        carrierCode = CanonicalCarrier.AMAZON_LOGISTICS;
        confidence += 0.25;
      }
    }

    // Generic Tracking Number Fallback
    if (!trackingNumber) {
      const genericMatch = text.match(/(?:tracking\s*(?:number|id|#)|awb\s*(?:no|#)?|waybill)[^\w]*([A-Z0-9]{8,24})/i);
      if (genericMatch) {
        trackingNumber = genericMatch[1];
        if (/delhivery/i.test(text)) carrierCode = CanonicalCarrier.DELHIVERY;
        else if (/blue\s*dart/i.test(text)) carrierCode = CanonicalCarrier.BLUEDART;
        else if (/ekart/i.test(text)) carrierCode = CanonicalCarrier.EKART;
        else if (/india\s*post/i.test(text)) carrierCode = CanonicalCarrier.INDIA_POST;
        confidence += 0.2;
      }
    }

    // 3. Extract Estimated Delivery Date if present
    let estimatedDeliveryAt: string | undefined;
    const dateMatch = text.match(/(?:arriving|expected(?:\s*by)?|delivery(?:\s*by)?)\s*[:\-]?\s*([A-Za-z]{3,9}\s+[0-9]{1,2}(?:st|nd|rd|th)?(?:,?\s+[0-9]{4})?)/i);
    if (dateMatch) {
      try {
        const parsed = new Date(dateMatch[1]);
        if (!isNaN(parsed.getTime())) {
          estimatedDeliveryAt = parsed.toISOString();
        }
      } catch {
        // fallback
      }
    }

    if (!trackingNumber) {
      return null;
    }

    return {
      trackingNumber: trackingNumber.trim(),
      carrierCode,
      merchantName,
      orderReference,
      estimatedDeliveryAt,
      confidence: Math.min(confidence, 1.0),
    };
  }
}


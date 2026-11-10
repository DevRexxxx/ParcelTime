import { CanonicalCarrier } from '@parceltime/shared';

export class ShipmentNormalizer {
  /**
   * Cleans and sanitizes a raw tracking number
   */
  static cleanTrackingNumber(raw: string): string {
    if (!raw) return '';
    return raw
      .trim()
      .replace(/[\s\-_#:]+/g, '')
      .toUpperCase();
  }

  /**
   * Normalizes raw carrier codes/names to CanonicalCarrier enum
   */
  static normalizeCarrier(raw: string): CanonicalCarrier {
    if (!raw) return CanonicalCarrier.OTHER;
    const normalized = raw.trim().toLowerCase();

    if (normalized.includes('delhivery')) return CanonicalCarrier.DELHIVERY;
    if (normalized.includes('blue') && normalized.includes('dart')) return CanonicalCarrier.BLUEDART;
    if (normalized.includes('bluedart')) return CanonicalCarrier.BLUEDART;
    if (normalized.includes('ekart')) return CanonicalCarrier.EKART;
    if (normalized.includes('amazon') || normalized.includes('amzn')) return CanonicalCarrier.AMAZON_LOGISTICS;
    if (normalized.includes('ecom')) return CanonicalCarrier.ECOM_EXPRESS;
    if (normalized.includes('fedex')) return CanonicalCarrier.FEDEX;
    if (normalized.includes('dtdc')) return CanonicalCarrier.DTDC;
    if (normalized.includes('post') || normalized.includes('speed')) return CanonicalCarrier.INDIA_POST;
    if (normalized.includes('shadowfax')) return CanonicalCarrier.SHADOWFAX;

    return CanonicalCarrier.OTHER;
  }
}

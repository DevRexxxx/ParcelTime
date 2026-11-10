import { TrackingProvider } from './tracking-provider.interface';
import { AftershipAdapter } from './aftership.adapter';
import { ShiprocketAdapter } from './shiprocket.adapter';
import { MockCarrierAdapter } from './mock-carrier.adapter';

export class TrackingRegistry {
  private static providers: Map<string, TrackingProvider> = new Map();

  static initialize() {
    this.register(new AftershipAdapter());
    this.register(new ShiprocketAdapter());
    this.register(new MockCarrierAdapter('MOCK_CARRIER'));
    this.register(new MockCarrierAdapter('DELHIVERY'));
    this.register(new MockCarrierAdapter('BLUEDART'));
  }

  static register(provider: TrackingProvider) {
    this.providers.set(provider.name.toUpperCase(), provider);
  }

  static get(name: string): TrackingProvider {
    if (this.providers.size === 0) {
      this.initialize();
    }
    const provider = this.providers.get(name.toUpperCase());
    if (!provider) {
      // Default to mock adapter for unrecognized carrier names in test/dev
      return new MockCarrierAdapter(name.toUpperCase());
    }
    return provider;
  }
}

import { prisma } from '../../lib/prisma';
import { IntegrationProvider, IntegrationStatus, ShipmentDiscoverySource, ShipmentExternalStatus, ShipmentInternalStatus } from '@parceltime/shared';
import { GmailParser, ParsedEmailShipment } from './gmail.parser';

export class GmailAdapter {
  /**
   * Connect Gmail integration for a resident
   */
  static async connect(params: {
    societyId: string;
    userId: string;
    authCode: string;
    redirectUri?: string;
  }) {
    // In production, exchange authCode for refresh/access token via Google OAuth client
    const grantedScopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const watchExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const integration = await prisma.externalIntegration.upsert({
      where: {
        societyId_userId_provider: {
          societyId: params.societyId,
          userId: params.userId,
          provider: IntegrationProvider.GMAIL,
        },
      },
      update: {
        status: IntegrationStatus.ACTIVE,
        grantedScopes,
        watchExpiresAt,
        lastSyncedAt: new Date(),
        lastCursor: 'history_cursor_init',
      },
      create: {
        societyId: params.societyId,
        userId: params.userId,
        provider: IntegrationProvider.GMAIL,
        status: IntegrationStatus.ACTIVE,
        grantedScopes,
        watchExpiresAt,
        lastSyncedAt: new Date(),
        lastCursor: 'history_cursor_init',
      },
    });

    return integration;
  }

  /**
   * Disconnect integration and optionally purge resident synced shipments
   */
  static async disconnect(params: {
    societyId: string;
    userId: string;
    deleteData?: boolean;
  }) {
    const integration = await prisma.externalIntegration.findUnique({
      where: {
        societyId_userId_provider: {
          societyId: params.societyId,
          userId: params.userId,
          provider: IntegrationProvider.GMAIL,
        },
      },
    });

    if (!integration) {
      return { disconnected: true, deletedShipments: 0 };
    }

    await prisma.externalIntegration.update({
      where: { id: integration.id },
      data: { status: IntegrationStatus.REVOKED },
    });

    let deletedCount = 0;
    if (params.deleteData) {
      // Data minimization & resident right to erasure: delete discovered shipments not yet physically received at gate
      const deleteResult = await prisma.shipment.deleteMany({
        where: {
          societyId: params.societyId,
          residentId: params.userId,
          discoverySource: ShipmentDiscoverySource.GMAIL,
          matchedParcelId: null, // Don't delete physical custody records if parcel already received
        },
      });
      deletedCount = deleteResult.count;
    }

    return { disconnected: true, deletedShipments: deletedCount };
  }

  /**
   * Parse inbound email and return structured discovery candidate
   */
  static processInboundEmail(email: {
    subject: string;
    from: string;
    body: string;
    snippet?: string;
  }): ParsedEmailShipment | null {
    return GmailParser.parseEmail(email);
  }
}

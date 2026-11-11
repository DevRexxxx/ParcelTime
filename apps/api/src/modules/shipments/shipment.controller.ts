import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import { CreateManualShipmentSchema, MatchShipmentToParcelSchema } from '@parceltime/shared';
import { ShipmentService } from './shipment.service';

export async function createManualShipment(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = CreateManualShipmentSchema.parse(req.body);
    const shipment = await ShipmentService.createManualShipment(
      req.user!.societyId,
      req.user!.userId,
      data
    );
    res.status(201).json(shipment);
  } catch (e) {
    next(e);
  }
}

export async function listResidentShipments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const shipments = await ShipmentService.listResidentShipments(
      req.user!.societyId,
      req.user!.userId
    );
    res.json(shipments);
  } catch (e) {
    next(e);
  }
}

export async function getExpectedShipments(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const expected = await ShipmentService.getExpectedShipmentsForReception(
      req.user!.societyId
    );
    res.json(expected);
  } catch (e) {
    next(e);
  }
}

export async function matchShipmentToParcel(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = MatchShipmentToParcelSchema.parse(req.body);
    const result = await ShipmentService.matchShipmentToParcel(
      req.user!.societyId,
      data.shipmentId,
      data.parcelId,
      req.user!.userId
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
}


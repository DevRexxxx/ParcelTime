import { Request, Response, NextFunction } from 'express';
import { WebhookService } from './webhook.service';

export async function handleTrackingWebhook(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const provider = req.params.provider;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const headers = req.headers as Record<string, string | string[] | undefined>;

    const result = await WebhookService.ingestWebhook(
      provider,
      rawBody,
      headers,
      req.body
    );

    res.status(200).json(result);
  } catch (e: any) {
    if (e.statusCode) {
      res.status(e.statusCode).json({ error: e.message });
      return;
    }
    next(e);
  }
}

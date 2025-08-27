import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';

export function verifyApiKey(req: Request, res: Response, next: NextFunction):Response | undefined {
  const clientKey = req.headers['x-api-key'];

  const serverKey = config.frontApiKey;

  if (!serverKey) {
    console.error('FRONTEND_API_KEY not set in environment variables.');
    return res.status(500).json({ message: 'Internal Server Error' });
  }

  if (typeof clientKey !== 'string' || clientKey !== serverKey) {
    return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
  }

  next();
}

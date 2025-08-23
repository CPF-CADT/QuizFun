// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { JWT } from '../service/JWT';
import { Role } from '../types/auth';
import { UserPayload } from '../types/express';

// --- Auth middleware ---
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = JWT.verifyAccessToken(token) as UserPayload;

    req.user = decoded;

    next();
  } catch (err: any) {
    return res.status(401).json({ message: err.message || 'Unauthorized: Invalid token' });
  }
}

// --- Role authorization ---
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    if (user.role && !allowedRoles.includes(user.role as Role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
}

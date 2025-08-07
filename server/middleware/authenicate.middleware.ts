import { Request, Response, NextFunction } from 'express';
import JWT from '../service/JWT';
import { JwtPayload } from 'jsonwebtoken';
import { UserRepository } from '../repositories/users.repositories';

type Role = 'admin' | 'user' | 'guest';

interface UserPayload extends JwtPayload {
  id: number;
  phone_number: string;
  name: string;
  profile_img_path: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export async function isEmailVerified(req: Request, res: Response, next: NextFunction) {
  const { email } = req.body;

  try {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Email not verified' });
    }

    next(); 
  } catch (err) {
    return res.status(500).json({
      message: (err as Error).message || 'Internal server error while checking email verification'
    });
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = JWT.verify(token) as UserPayload;

    req.user = {
      id: decoded.id,
      phone_number: decoded.phone_number,
      name: decoded.name,
      profile_img_path: decoded.profile_img_path,
      role: decoded.role,
    };

    next();
  } catch (err: any) {
    return res.status(401).json({ message: err.message || 'Unauthorized: Invalid token' });
  }
}

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
}

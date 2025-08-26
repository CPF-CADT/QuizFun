// service/JWT.ts
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { UserPayload } from '../types/express';

export class JWT {
  static JWT_SECRET = config.jwtSecret;
  static JWT_REFRESH_SECRET = config.jwtRefreshSecret;

  static createTokens(user: UserPayload): { accessToken: string; refreshToken: string } {
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string) {
    return jwt.verify(token, this.JWT_SECRET);
  }

  static verifyRefreshToken(token: string) {
    return jwt.verify(token, this.JWT_REFRESH_SECRET);
  }
}

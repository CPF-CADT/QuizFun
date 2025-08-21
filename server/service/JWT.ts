import jwt from 'jsonwebtoken';
import { config } from '../config/config';
export class JWT {
    static JWT_SECRET = config.jwtSecret;
    static JWT_REFRESH_SECRET = config.jwtRefreshSecret;
    static createTokens({
        id,
        email,
        role
    }: {
        id: string;
        email?: string;
        role: string;
    }): { accessToken: string; refreshToken: string } {
        
        const payload = { id, email, role };

        // Short-lived access token
        const accessToken = jwt.sign(payload, this.JWT_SECRET, {
            expiresIn: "15m"
        });

        // Long-lived refresh token
        const refreshToken = jwt.sign(payload, this.JWT_REFRESH_SECRET, {
            expiresIn: "7d"
        });

        return { accessToken, refreshToken };
    }

    static verifyAccessToken(token: string) {
        return jwt.verify(token, this.JWT_SECRET);
    }

    static verifyRefreshToken(token: string) {
        return jwt.verify(token, this.JWT_REFRESH_SECRET);
    }
}

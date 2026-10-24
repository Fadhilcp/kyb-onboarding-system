import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { ITokenService } from './interfaces/ITokenService';



export class TokenService implements ITokenService {
    private getAccessSecret(): string {
        return process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'supersecret_jwt_key_change_in_production';
    }

    private getRefreshSecret(): string {
        return (
            process.env.JWT_REFRESH_SECRET ||
            (process.env.JWT_SECRET ? `${process.env.JWT_SECRET}_refresh` : 'supersecret_jwt_refresh_key_change_in_production')
        );
    }

    generateAccessToken(user: { id: string; email: string; role: Role }): string {
        return jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            this.getAccessSecret(),
            { expiresIn: '15m' }
        );
    }

    generateRefreshToken(userId: string): string {
        return jwt.sign({ id: userId }, this.getRefreshSecret(), { expiresIn: '7d' });
    }

    verifyRefreshToken(token: string): { id: string } {
        try {
            return jwt.verify(token, this.getRefreshSecret()) as { id: string };
        } catch (err: any) {
            const error: any = new Error('Invalid or expired refresh token.');
            error.status = 401;
            error.code = 'REFRESH_TOKEN_EXPIRED';
            throw error;
        }
    }
}
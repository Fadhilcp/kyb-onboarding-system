import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { ITokenService } from './interfaces/ITokenService';



export class TokenService implements ITokenService {
    private getAccessSecret(): string {
        if (!process.env.JWT_ACCESS_SECRET) {
            throw new Error('JWT_ACCESS_SECRET is not defined.');
        }
        return process.env.JWT_ACCESS_SECRET;
    }

    private getRefreshSecret(): string {
        if (!process.env.JWT_REFRESH_SECRET) {
            throw new Error('JWT_REFRESH_SECRET is not defined.');
        }
        return process.env.JWT_REFRESH_SECRET;
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
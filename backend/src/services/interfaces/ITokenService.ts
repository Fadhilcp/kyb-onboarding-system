import { Role } from "@prisma/client";

export interface ITokenService {
    generateAccessToken(user: { id: string; email: string; role: Role }): string;
    generateRefreshToken(userId: string): string;
    verifyRefreshToken(token: string): { id: string };
}
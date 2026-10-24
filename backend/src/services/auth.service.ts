import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IAuthService } from './interfaces/IAuthService';
import { LoginDTO, AuthResponseDTO, RefreshTokenResponseDTO } from '../dtos/auth.dto';
import { Role } from '@prisma/client';

export class AuthService implements IAuthService {
  constructor(private readonly _userRepository: IUserRepository) {}

  private getAccessSecret(): string {
    return process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'supersecret_jwt_key_change_in_production';
  }

  private getRefreshSecret(): string {
    return (
      process.env.JWT_REFRESH_SECRET ||
      (process.env.JWT_SECRET ? `${process.env.JWT_SECRET}_refresh` : 'supersecret_jwt_refresh_key_change_in_production')
    );
  }

  private generateAccessToken(user: { id: string; email: string; role: Role }): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      this.getAccessSecret(),
      { expiresIn: '15m' }
    );
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      {
        id: userId,
      },
      this.getRefreshSecret(),
      { expiresIn: '7d' }
    );
  }

  async login(credentials: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this._userRepository.findByEmail(credentials.email);
    if (!user) {
      const error: any = new Error('User not found.');
      error.status = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(credentials.password, user.password);
    if (!isMatch) {
      const error: any = new Error('Invalid password.');
      error.status = 401;
      throw error;
    }

    const accessToken = this.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.generateRefreshToken(user.id);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string): Promise<RefreshTokenResponseDTO> {
    if (!token) {
      const error: any = new Error('Refresh token is required.');
      error.status = 401;
      throw error;
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, this.getRefreshSecret()) as { id: string };
    } catch (err: any) {
      const error: any = new Error('Invalid or expired refresh token.');
      error.status = 401;
      error.code = 'REFRESH_TOKEN_EXPIRED';
      throw error;
    }

    const user = await this._userRepository.findById(decoded.id);
    if (!user) {
      const error: any = new Error('User not found.');
      error.status = 401;
      throw error;
    }

    const newAccessToken = this.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = this.generateRefreshToken(user.id);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}

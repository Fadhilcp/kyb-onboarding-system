import bcrypt from 'bcrypt';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { IAuthService } from './interfaces/IAuthService';
import { LoginDTO, AuthResponseDTO, RefreshTokenResponseDTO } from '../dtos/auth.dto';
import { Role } from '@prisma/client';
import { ITokenService } from './interfaces/ITokenService';

export class AuthService implements IAuthService {
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _tokenService: ITokenService
  ) {}

  async login(credentials: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this._userRepository.findByEmail(credentials.email);
    if (!user) {
      const error: any = new Error('Admin not found.');
      error.status = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(credentials.password, user.password);
    if (!isMatch) {
      const error: any = new Error('Invalid password.');
      error.status = 401;
      throw error;
    }

    const accessToken = this._tokenService.generateAccessToken(user);
    const refreshToken = this._tokenService.generateRefreshToken(user.id);

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

    const decoded = this._tokenService.verifyRefreshToken(token);

    const user = await this._userRepository.findById(decoded.id);
    if (!user) {
      const error: any = new Error('User not found.');
      error.status = 401;
      throw error;
    }

    const newAccessToken = this._tokenService.generateAccessToken(user);
    const newRefreshToken = this._tokenService.generateRefreshToken(user.id);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}

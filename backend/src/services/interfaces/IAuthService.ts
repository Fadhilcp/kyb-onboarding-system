import { LoginDTO, AuthResponseDTO, RefreshTokenResponseDTO } from '../../dtos/auth.dto.js';

export interface IAuthService {
  login(credentials: LoginDTO): Promise<AuthResponseDTO>;
  refreshToken(token: string): Promise<RefreshTokenResponseDTO>;
  verifySession(refreshToken: string): Promise<{ id: string; email: string; role: string; accessToken: string }>;
}

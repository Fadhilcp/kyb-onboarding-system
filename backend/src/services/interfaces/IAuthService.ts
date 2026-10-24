import { LoginDTO, AuthResponseDTO, RefreshTokenResponseDTO } from '../../dtos/auth.dto';

export interface IAuthService {
  login(credentials: LoginDTO): Promise<AuthResponseDTO>;
  refreshToken(token: string): Promise<RefreshTokenResponseDTO>;
}

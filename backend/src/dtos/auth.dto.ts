import { Role } from '@prisma/client';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthTokensDTO {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDTO {
  id: string;
  email: string;
  role: Role;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponseDTO {
  id: string;
  email: string;
  role: Role;
  accessToken: string;
  refreshToken?: string;
}
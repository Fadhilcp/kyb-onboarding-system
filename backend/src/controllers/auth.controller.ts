import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../services/interfaces/IAuthService.js';
import { ZodType } from 'zod';
import { LoginDTO } from '../dtos/auth.dto.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/cookieUtils.js';
import { sendResponse } from '../utils/response.js';
import { AppError } from '../utils/appError.js';

export class AuthController {
  constructor(
    private readonly _authService: IAuthService,
    private readonly _loginSchema: ZodType<LoginDTO>
  ) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parseResult = this._loginSchema.safeParse(req.body);

      if (!parseResult.success) {
        next(parseResult.error);
        return;
      }

      const authResponse = await this._authService.login(parseResult.data);

      setRefreshTokenCookie(res, authResponse.refreshToken);

      sendResponse(res, 200, {
        message: 'Login successful',
        data: {
          id: authResponse.id,
          email: authResponse.email,
          role: authResponse.role,
        },
        accessToken: authResponse.accessToken,
      });
    } catch (err: any) {
      next(err);
    }
  };

  async refreshToken (req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!incomingRefreshToken) {
        throw new AppError('Unauthorized: No refresh token provided.', 401, 'NO_REFRESH_TOKEN');
      }

      const refreshResponse = await this._authService.refreshToken(incomingRefreshToken);

      if (refreshResponse.refreshToken) {
        setRefreshTokenCookie(res, refreshResponse.refreshToken);
      }

      sendResponse(res, 200, {
        message: 'Token refreshed successfully',
        data: {
          id: refreshResponse.id,
          email: refreshResponse.email,
          role: refreshResponse.role,
          accessToken: refreshResponse.accessToken,
        },
      });
    } catch (err: any) {
      next(err);
    }
  };

  async verifySession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        clearRefreshTokenCookie(res);
        throw new AppError('No refresh token found. Please log in.', 401, 'UNAUTHORIZED');
      }
      const sessionData = await this._authService.verifySession(refreshToken);

      sendResponse(res, 200, {
        message: 'Session verified successfully.',
        data: {
          id: sessionData.id,
          email: sessionData.email,
          role: sessionData.role,
        },
        accessToken: sessionData.accessToken,
      });
    } catch (err: any) {
      clearRefreshTokenCookie(res);
      next(new AppError('Invalid or expired refresh token.', 403, 'FORBIDDEN'));
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      clearRefreshTokenCookie(res);

      sendResponse(res, 200, {
        message: 'Logged out successfully.',
      });
    } catch (err: any) {
      next(err);
    }
  };
}

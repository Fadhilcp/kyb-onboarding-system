import { Request, Response, NextFunction } from 'express';
import { IAuthService } from '../services/interfaces/IAuthService';
import { ZodType } from 'zod';
import { LoginDTO } from '../dtos/auth.dto';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/cookieUtils';
import { sendResponse } from '../utils/response';
import { AppError } from '../utils/appError';

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

import { Request, Response } from 'express';
import { IAuthService } from '../services/interfaces/IAuthService';
import { z, ZodType } from 'zod';
import { LoginDTO } from '../dtos/auth.dto';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/cookieUtils';

export class AuthController {
  constructor(
    private readonly _authService: IAuthService,
    private readonly _loginSchema: ZodType<LoginDTO>
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const parseResult = this._loginSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        const errors = parseResult.error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        res.status(400).json({ success: false, error: 'Validation failed', details: errors });
        return;
      }

      const authResponse = await this._authService.login(parseResult.data);

      setRefreshTokenCookie(res, authResponse.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          id: authResponse.id,
          email: authResponse.email,
          role: authResponse.role,
        },
        accessToken: authResponse.accessToken
      });
    } catch (err: any) {
      const status = err.status || 500;
      res.status(status).json({
        success: false,
        error: err.message || 'An error occurred during login.',
      });
    }
  };

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!incomingRefreshToken) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized: No refresh token provided.',
        });
        return;
      }

      const refreshResponse = await this._authService.refreshToken(incomingRefreshToken);

      if (refreshResponse.refreshToken) {
        setRefreshTokenCookie(res, refreshResponse.refreshToken);
      }

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          id: refreshResponse.id,
          email: refreshResponse.email,
          role: refreshResponse.role,
          accessToken: refreshResponse.accessToken
        }
      });
    } catch (err: any) {
      const status = err.status || 401;
      res.status(status).json({
        success: false,
        code: err.code || 'TOKEN_REFRESH_FAILED',
        error: err.message || 'Failed to refresh token.',
      });
    }
  };

  async logout (_req: Request, res: Response): Promise<void> {
    clearRefreshTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  };
}

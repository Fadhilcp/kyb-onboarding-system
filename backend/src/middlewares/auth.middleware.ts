import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface TokenPayload {
  id?: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: No authorization token provided.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret =
    process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_SECRET ||
    'supersecret_jwt_key_change_in_production';

  try {
    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        error: 'Unauthorized: Token expired.',
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid token.',
    });
    return;
  }
};


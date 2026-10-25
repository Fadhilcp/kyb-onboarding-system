import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./auth.middleware.js";
import { Role } from "@prisma/client";

export const checkRoleMiddleware = (requiredRole: Role) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required.',
      });
      return;
    }

    if (req.user.role !== requiredRole) {
      res.status(403).json({
        success: false,
        error: `Forbidden: Only ${requiredRole} can access this resource.`,
      });
      return;
    }

    next();
  };
};

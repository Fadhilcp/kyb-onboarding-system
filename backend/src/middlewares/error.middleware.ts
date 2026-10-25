import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { sendResponse } from '../utils/response.js';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Zod validation erros
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    sendResponse(res, 400, {
      success: false,
      error: 'Validation failed',
      details,
    });
    return;
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    let message = err.message || 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size exceeds the 10MB limit.';
    }

    sendResponse(res, 400, {
      success: false,
      error: message,
      code: err.code,
    });
    return;
  }

  // Custom AppError or errors with explicit status
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';
  const code = err.code;
  const details = err.details;

  sendResponse(res, statusCode, {
    success: false,
    error: message,
    ...(code && { code }),
    ...(details && { details }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

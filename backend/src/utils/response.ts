import { Response } from 'express';

export interface ApiResponseOptions {
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
  [key: string]: any;
}

export const sendResponse = (
  res: Response, statusCode: number, payload: ApiResponseOptions = {}
): Response => {
  const isSuccess = statusCode >= 200 && statusCode < 300;

  return res.status(statusCode).json({
    success: isSuccess,
    ...payload,
  });
};

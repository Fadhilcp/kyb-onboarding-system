import express, { Application, Request, Response } from 'express';
import cors from 'cors';

const app: Application = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'KYB Onboarding Backend API is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'KYB Onboarding Backend API is healthy and operational',
    timestamp: new Date().toISOString(),
  });
});

export default app;

import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import applicationRouter from './routes/application.route';
import authRouter from './routes/auth.route';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: process.env.CORS_METHODS?.split(','),
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(','),
  credentials: process.env.CORS_CREDENTIALS === 'true',
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/applications', applicationRouter);

app.use(errorHandler);

export default app;

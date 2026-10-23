import express, { Application } from 'express';
import cors from 'cors';
import applicationRouter from './routes/application.route';

const app: Application = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: process.env.CORS_METHODS?.split(','),
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(','),
  credentials: process.env.CORS_CREDENTIALS === 'true',
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/applications', applicationRouter);

export default app;

import { Router } from 'express';
import { prisma } from '../config/prisma';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { loginSchema } from '../utils/validation';

const authRouter = Router();

const userRepository = new UserRepository(prisma);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService, loginSchema);

authRouter.post('/login', authController.login.bind(authController));
authRouter.post('/refresh', authController.refreshToken.bind(authController));
authRouter.post('/logout', authController.logout.bind(authController));

export default authRouter;

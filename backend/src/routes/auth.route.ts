import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { UserRepository } from '../repositories/user.repository.js';
import { AuthService } from '../services/auth.service.js';
import { AuthController } from '../controllers/auth.controller.js';
import { loginSchema } from '../utils/validation.js';
import { TokenService } from '../services/token.service.js';

const authRouter = Router();

const userRepository = new UserRepository(prisma);
const tokenService = new TokenService();
const authService = new AuthService(userRepository, tokenService);
const authController = new AuthController(authService, loginSchema);

authRouter.post('/login', authController.login.bind(authController));
authRouter.post('/refresh', authController.refreshToken.bind(authController));
authRouter.get('/me', authController.verifySession.bind(authController));
authRouter.post('/logout', authController.logout.bind(authController));

export default authRouter;

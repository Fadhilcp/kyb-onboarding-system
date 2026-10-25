import { Router } from 'express';
import { Role } from '@prisma/client';
import { ApplicationController } from '../controllers/application.controller.js';
import { ApplicationService } from '../services/application.service.js';
import { ApplicationRepository } from '../repositories/application.repository.js';
import { uploadDocument } from '../config/multer.js';
import { prisma } from '../config/prisma.js';
import { createApplicationSchema } from '../utils/validation.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { checkRoleMiddleware } from '../middlewares/checkRole.middleware.js';
import { AIService } from '../services/ai.service.js';
import { geminiClient } from '../config/genAi.js';

const applicationRouter = Router();

const applicationRepository = new ApplicationRepository(prisma);
const aiService = new AIService(geminiClient);
const applicationService = new ApplicationService(applicationRepository, aiService);
const applicationController = new ApplicationController(
  applicationService,
  createApplicationSchema
);

applicationRouter.post(
  '/',
  uploadDocument.single('document'),
  applicationController.submitApplication.bind(applicationController)
);

applicationRouter.get(
  '/',
  authMiddleware,
  checkRoleMiddleware(Role.REVIEWER),
  applicationController.getApplications.bind(applicationController)
);

applicationRouter.get(
  '/:applicationId',
  authMiddleware,
  checkRoleMiddleware(Role.REVIEWER),
  applicationController.getApplicationById.bind(applicationController)
);

applicationRouter.patch(
  '/:applicationId/decision',
  authMiddleware,
  checkRoleMiddleware(Role.REVIEWER),
  applicationController.updateDecision.bind(applicationController)
);

export default applicationRouter;
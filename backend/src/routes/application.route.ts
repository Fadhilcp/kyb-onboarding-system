import { Router } from 'express';
import { Role } from '@prisma/client';
import { ApplicationController } from '../controllers/application.controller';
import { ApplicationService } from '../services/application.service';
import { ApplicationRepository } from '../repositories/application.repository';
import { uploadDocument } from '../config/multer';
import { prisma } from '../config/prisma';
import { createApplicationSchema } from '../utils/validation';
import { authMiddleware } from '../middlewares/auth.middleware';
import { checkRoleMiddleware } from '../middlewares/checkRole.middleware';
import { AIService } from '../services/ai.service';
import { geminiClient } from '../config/genAi';

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
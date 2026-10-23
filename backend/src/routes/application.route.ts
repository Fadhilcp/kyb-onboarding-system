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

const applicationRouter = Router();

const applicationRepository = new ApplicationRepository(prisma);
const applicationService = new ApplicationService(applicationRepository);
const applicationController = new ApplicationController(
  applicationService,
  createApplicationSchema
);

applicationRouter.post(
  '/',
  uploadDocument.single('document'),
  applicationController.submitApplication
);

applicationRouter.get(
  '/',
  authMiddleware,
  checkRoleMiddleware(Role.REVIEWER),
  applicationController.getApplications
);

applicationRouter.get(
  '/:id',
  authMiddleware,
  checkRoleMiddleware(Role.REVIEWER),
  applicationController.getApplicationById
);

applicationRouter.patch(
  '/:id/decision',
  authMiddleware,
  checkRoleMiddleware(Role.REVIEWER),
  applicationController.updateDecision
);

export default applicationRouter;
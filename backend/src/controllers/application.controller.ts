import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';
import { IApplicationService } from '../services/interfaces/IApplicationService.js';
import { CreateApplicationDTO } from '../dtos/application.dto.js';
import { CreateApplicationInput } from '../utils/validation.js';
import { toApplicationTableDTOs } from '../mappers/application.mapper.js';
import { sendResponse } from '../utils/response.js';
import { AppError } from '../utils/appError.js';

export class ApplicationController {
  constructor(
    private readonly _applicationService: IApplicationService,
    private readonly _validationSchema: z.ZodType<CreateApplicationInput>
  ) {}

  async submitApplication (req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new AppError('Document file is required (PDF, JPEG, PNG, or WebP).', 400);
      }

      const parseResult = this._validationSchema.safeParse(req.body);
      if (!parseResult.success) {
        next(parseResult.error);
        return;
      }

      const validated = parseResult.data;

      const applicationDto: CreateApplicationDTO = {
        businessName: validated.businessName,
        registrationNumber: validated.registrationNumber,
        registrationExpiry: validated.registrationExpiry,
        ownerName: validated.ownerName,
        contactEmail: validated.contactEmail,
      };

      const application = await this._applicationService.submitApplication(
        applicationDto,
        req.file.path
      );

      sendResponse(res, 201, {
        message: 'Application submitted successfully',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  };

  async getApplications (req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statusQuery = req.query.status as string | undefined;

      let filterStatus: ApplicationStatus | undefined;
      if (statusQuery) {
        const validStatuses = Object.values(ApplicationStatus);
        if (!validStatuses.includes(statusQuery as ApplicationStatus)) {
          throw new AppError(
            `Invalid status filter '${statusQuery}'. Valid statuses: ${validStatuses.join(', ')}`,
            400
          );
        }
        filterStatus = statusQuery as ApplicationStatus;
      }

      const applications = await this._applicationService.getApplications(filterStatus);

      sendResponse(res, 200, {
        count: applications.length,
        data: toApplicationTableDTOs(applications),
      });
    } catch (error) {
      next(error);
    }
  };

  async getApplicationById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.applicationId;
      if (!id) {
        throw new AppError('Application ID is required.', 400);
      }

      const application = await this._applicationService.getApplicationById(id.toString());
      if (!application) {
        throw new AppError(`Application with ID '${id}' not found.`, 404);
      }

      sendResponse(res, 200, {
        data: application,
      });
    } catch (error) {
      next(error);
    }
  };

  async updateDecision(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.applicationId || req.params.id;
      const { status } = req.body;

      if (!id) {
        throw new AppError('Application ID is required.', 400);
      }

      if (!status) {
        throw new AppError("Decision 'status' is required in request body.", 400);
      }

      if (
        status !== ApplicationStatus.APPROVED &&
        status !== ApplicationStatus.REJECTED
      ) {
        throw new AppError("Decision status must be either 'APPROVED' or 'REJECTED'.", 400);
      }

      const updatedApplication = await this._applicationService.updateDecision(
        id.toString(),
        status as ApplicationStatus
      );

      sendResponse(res, 200, {
        message: `Application has been ${status.toLowerCase()} successfully.`,
        data: updatedApplication,
      });
    } catch (error: any) {
      next(error);
    }
  };
}
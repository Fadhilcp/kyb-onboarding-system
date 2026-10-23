import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';
import { IApplicationService } from '../services/interfaces/IApplicationService';
import { CreateApplicationDTO } from '../dtos/application.dto';
import { CreateApplicationInput } from '../utils/validation';

export class ApplicationController {
  constructor(
    private readonly _applicationService: IApplicationService,
    private readonly _validationSchema: z.ZodType<CreateApplicationInput>
  ) {}

    submitApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'Document file is required (PDF, JPEG, PNG, or WebP).',
        });
        return;
      }

      const parseResult = this._validationSchema.safeParse(req.body);
      if (!parseResult.success) {
        const issues = parseResult.error.issues || [];
        const errors = issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        res.status(400).json({ success: false, error: 'Validation failed', details: errors });
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

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  };

  getApplications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const statusQuery = req.query.status as string | undefined;

      let filterStatus: ApplicationStatus | undefined;
      if (statusQuery) {
        const validStatuses = Object.values(ApplicationStatus);
        if (!validStatuses.includes(statusQuery as ApplicationStatus)) {
          res.status(400).json({
            success: false,
            error: `Invalid status filter '${statusQuery}'. Valid statuses: ${validStatuses.join(', ')}`,
          });
          return;
        }
        filterStatus = statusQuery as ApplicationStatus;
      }

      const applications = await this._applicationService.getApplications(filterStatus);

      res.status(200).json({
        success: true,
        count: applications.length,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  };

  getApplicationById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Application ID is required.',
        });
        return;
      }

      const application = await this._applicationService.getApplicationById(id.toString());
      if (!application) {
        res.status(404).json({
          success: false,
          error: `Application with ID '${id}' not found.`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: application,
      });
    } catch (error) {
      next(error);
    }
  };

  updateDecision = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Application ID is required.',
        });
        return;
      }

      if (!status) {
        res.status(400).json({
          success: false,
          error: "Decision 'status' is required in request body.",
        });
        return;
      }

      if (
        status !== ApplicationStatus.APPROVED &&
        status !== ApplicationStatus.REJECTED
      ) {
        res.status(400).json({
          success: false,
          error: "Decision status must be either 'APPROVED' or 'REJECTED'.",
        });
        return;
      }

      const updatedApplication = await this._applicationService.updateDecision(
        id.toString(),
        status as ApplicationStatus
      );

      res.status(200).json({
        success: true,
        message: `Application has been ${status.toLowerCase()} successfully.`,
        data: updatedApplication,
      });
    } catch (error: any) {
      const statusCode = error.status || 500;
      res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to update application decision.',
      });
    }
  };
}
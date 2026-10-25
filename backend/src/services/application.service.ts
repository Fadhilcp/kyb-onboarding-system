import { Application, ApplicationStatus } from '@prisma/client';
import { IApplicationRepository } from '../repositories/interfaces/IApplicationRepository.js';
import { IApplicationService } from './interfaces/IApplicationService.js';
import { CreateApplicationDTO } from '../dtos/application.dto.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import { IAIService } from './interfaces/IAIService.js';

export class ApplicationService implements IApplicationService {
  constructor(
    private readonly _applicationRepository: IApplicationRepository,
    private readonly _aiService: IAIService
  ) {}

  async submitApplication(
    applicationDto: CreateApplicationDTO,
    filePath: string
  ): Promise<Application> {
    let documentUrl = applicationDto.documentUrl;

    if (filePath) {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: 'kyb-onboarding/documents',
        resource_type: 'auto',
      });
      documentUrl = uploadResult.secure_url;

      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn('Could not remove temporary upload file:', err);
      }
    }

    if (!documentUrl) {
      throw new Error('Failed to upload and obtain document URL.');
    }

    const createdApplication = await this._applicationRepository.create({
      businessName: applicationDto.businessName,
      registrationNumber: applicationDto.registrationNumber,
      registrationExpiry: applicationDto.registrationExpiry,
      ownerName: applicationDto.ownerName,
      contactEmail: applicationDto.contactEmail,
      documentUrl,
      status: ApplicationStatus.SUBMITTED,
    });

    this.processAiReviewInBackground(createdApplication.id, applicationDto, documentUrl);

    return createdApplication;
  }

  private async processAiReviewInBackground(
    applicationId: string, applicationDto: CreateApplicationDTO,
    documentUrl: string): Promise<void> {
    try {
      const aiAnalysisResult = await this._aiService.analyzeApplication(applicationDto, documentUrl);

      if (aiAnalysisResult.error) {
        throw new Error(aiAnalysisResult.error);
      }

      await this._applicationRepository.updateStatus(
        applicationId,
        ApplicationStatus.AI_REVIEWED,
        aiAnalysisResult
      );
    } catch (err: any) {
      console.error(`Background AI verification failed for application ${applicationId}:`, err);
      
      await this._applicationRepository.updateStatus(
        applicationId,
        ApplicationStatus.AI_REVIEW_FAILED,
        {
          error: err?.message || 'AI verification failed',
          reviewedAt: new Date().toISOString(),
        }
      );
    }
  }

  async getApplications(status?: ApplicationStatus): Promise<Application[]> {
    return await this._applicationRepository.findManyByStatus(status);
  }

  async getApplicationById(id: string): Promise<Application | null> {
    return await this._applicationRepository.findById(id);
  }

  async updateDecision(id: string, newStatus: ApplicationStatus): Promise<Application> {
    if (
      newStatus !== ApplicationStatus.APPROVED &&
      newStatus !== ApplicationStatus.REJECTED
    ) {
      throw new Error(
        `Invalid decision status: '${newStatus}'. Only 'APPROVED' or 'REJECTED' decisions are permitted.`
      );
    }

    const application = await this._applicationRepository.findById(id);
    if (!application) {
      const notFoundError: any = new Error(`Application with ID '${id}' not found.`);
      notFoundError.status = 404;
      throw notFoundError;
    }

    if (application.status === ApplicationStatus.DRAFT) {
      const badRequestError: any = new Error(
        'Invalid status transition: Cannot approve or reject an application in DRAFT status.'
      );
      badRequestError.status = 400;
      throw badRequestError;
    }

    if (
      application.status === ApplicationStatus.APPROVED ||
      application.status === ApplicationStatus.REJECTED
    ) {
      const conflictError: any = new Error(
        `Application decision has already been finalized as '${application.status}'.`
      );
      conflictError.status = 409;
      throw conflictError;
    }

    const updated = await this._applicationRepository.updateStatus(id, newStatus);
    if (!updated) {
      throw new Error(`Failed to update application decision status.`);
    }

    return updated;
  }
}
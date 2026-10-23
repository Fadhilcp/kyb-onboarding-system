import { Application, ApplicationStatus } from '@prisma/client';
import { IApplicationRepository } from '../repositories/interfaces/IApplicationRepository';
import { IApplicationService } from './interfaces/IApplicationService';
import { CreateApplicationDTO } from '../dtos/application.dto';
import cloudinary from '../config/cloudinary';
import fs from 'fs';

export class ApplicationService implements IApplicationService {
  constructor(private readonly _applicationRepository: IApplicationRepository) {}

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

    return createdApplication;
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
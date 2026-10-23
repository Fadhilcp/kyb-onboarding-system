import { Application, ApplicationStatus } from '@prisma/client';
import { CreateApplicationDTO } from '../../dtos/application.dto';

export interface IApplicationService {
  submitApplication(applicationDto: CreateApplicationDTO, filePath: string): Promise<Application>;
  getApplications(status?: ApplicationStatus): Promise<Application[]>;
  getApplicationById(id: string): Promise<Application | null>;
  updateDecision(id: string, status: ApplicationStatus): Promise<Application>;
}
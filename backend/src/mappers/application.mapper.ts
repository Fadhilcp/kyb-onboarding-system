import { Application } from '@prisma/client';

export interface ApplicationTableItemDTO {
  id: string;
  businessName: string;
  registrationNumber: string;
  ownerName: string;
  contactEmail: string;
  status: string;
  createdAt: Date | string;
  aiReviewSummary?: {
    riskScore?: number;
    riskLevel?: string;
  } | null;
}

export const toApplicationTableDTO = (app: Application): ApplicationTableItemDTO => {
  const aiSummary = app.aiReviewSummary as Record<string, any> | null;

  return {
    id: app.id,
    businessName: app.businessName,
    registrationNumber: app.registrationNumber,
    ownerName: app.ownerName,
    contactEmail: app.contactEmail,
    status: app.status,
    createdAt: app.createdAt,
    aiReviewSummary: aiSummary
      ? {
          riskScore: aiSummary.riskScore,
          riskLevel: aiSummary.riskLevel,
        }
      : null,
  };
};

export const toApplicationTableDTOs = (apps: Application[]): ApplicationTableItemDTO[] => {
  return apps.map(toApplicationTableDTO);
};

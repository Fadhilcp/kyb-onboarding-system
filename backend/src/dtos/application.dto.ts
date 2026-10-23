import { ApplicationStatus, Prisma } from "@prisma/client";

export interface CreateApplicationDTO {
    businessName: string;
    registrationNumber: string;
    registrationExpiry: Date;
    ownerName: string;
    contactEmail: string;
    documentUrl: string;
}

export interface UpdateApplicationStatusDTO {
    status: ApplicationStatus;
    aiReviewSummary: Prisma.JsonValue;
}
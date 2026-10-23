export type Role = 'BUSINESS' | 'REVIEWER';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'AI_REVIEWED'
  | 'AI_REVIEW_FAILED'
  | 'APPROVED'
  | 'REJECTED';

export interface AiReviewSummary {
  reviewedAt?: string;
  riskScore?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation?: string;
  findings?: string[];
  documentMetadata?: {
    documentUrl?: string;
    verifiedName?: string;
    verifiedRegistrationNumber?: string;
  };
  error?: string;
  [key: string]: any;
}

export interface Application {
  id: string;
  businessName: string;
  registrationNumber: string;
  registrationExpiry: string;
  ownerName: string;
  contactEmail: string;
  documentUrl: string;
  status: ApplicationStatus;
  aiReviewSummary?: AiReviewSummary | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationPayload {
  businessName: string;
  registrationNumber: string;
  registrationExpiry: string;
  ownerName: string;
  contactEmail: string;
  document: File;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface ApplicationFormData {
  businessName: string;
  registrationNumber: string;
  registrationExpiry: string; // ISO date string
  ownerName: string;
  contactEmail: string;
}

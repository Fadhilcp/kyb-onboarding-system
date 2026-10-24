export interface AiReviewAnalysisResult {
  reviewedAt: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: string;
  findings: string[];
  documentMetadata?: {
    documentUrl?: string;
    verifiedName?: string;
    verifiedRegistrationNumber?: string;
  };
  error?: string;
  [key: string]: any;
}
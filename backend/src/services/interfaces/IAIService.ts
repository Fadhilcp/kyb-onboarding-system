import { AiReviewAnalysisResult } from '../../dtos/ai.dto.js';
import { CreateApplicationDTO } from '../../dtos/application.dto.js';

export interface IAIService {
  analyzeApplication(data: CreateApplicationDTO, documentUrl: string): Promise<AiReviewAnalysisResult>;
}

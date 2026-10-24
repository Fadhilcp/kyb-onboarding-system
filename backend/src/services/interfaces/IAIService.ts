import { AiReviewAnalysisResult } from '../../dtos/ai.dto';
import { CreateApplicationDTO } from '../../dtos/application.dto';

export interface IAIService {
  analyzeApplication(data: CreateApplicationDTO, documentUrl: string): Promise<AiReviewAnalysisResult>;
}

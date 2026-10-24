import { GoogleGenAI } from '@google/genai';
import { CreateApplicationDTO } from '../dtos/application.dto';
import { IAIService } from './interfaces/IAIService';
import { buildKybReviewPrompt, cleanAndParseAiJson, resolveDocumentMimeType } from '../utils/aiUtils';
import { AiReviewAnalysisResult } from '../dtos/ai.dto';

export class AIService implements IAIService {
  private ai: GoogleGenAI;

  constructor(client: GoogleGenAI) {
    this.ai = client;
  }

  async analyzeApplication(
    data: CreateApplicationDTO,
    documentUrl: string
  ): Promise<AiReviewAnalysisResult> {
    const documentResponse = await fetch(documentUrl);
    if (!documentResponse.ok) {
      throw new Error(
        `Failed to fetch document for AI analysis from ${documentUrl}: ${documentResponse.statusText}`
      );
    }

    const arrayBuffer = await documentResponse.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    let mimeType = resolveDocumentMimeType(documentUrl, documentResponse.headers.get('content-type'));

    const prompt = buildKybReviewPrompt(data);

    const modelName = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";

    const response = await this.ai.models.generateContent({
      model: modelName,
      contents: [
        { text: prompt },
        { inlineData: { mimeType, data: base64Data } },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini API returned an empty response.');
    }

    const parsed = cleanAndParseAiJson(responseText);

    return {
      reviewedAt: new Date().toISOString(),
      riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : 50,
      riskLevel: ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.riskLevel)
        ? parsed.riskLevel
        : 'MEDIUM',
      recommendation: parsed.recommendation || 'RECOMMEND_MANUAL_REVIEW',
      findings: Array.isArray(parsed.findings) ? parsed.findings : [],
      documentMetadata: {
        documentUrl,
        verifiedName: parsed.documentMetadata?.verifiedName || '',
        verifiedRegistrationNumber: parsed.documentMetadata?.verifiedRegistrationNumber || '',
      },
    };
  }
}

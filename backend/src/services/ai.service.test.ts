import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIService } from './ai.service.js';
import type { GoogleGenAI } from '@google/genai';

// Mock the utilities to isolate the service logic
vi.mock('../utils/aiUtils.js', () => ({
    buildKybReviewPrompt: vi.fn().mockReturnValue('fake_prompt'),
    resolveDocumentMimeType: vi.fn().mockReturnValue('application/pdf'),
    cleanAndParseAiJson: vi.fn().mockReturnValue({
        riskScore: 20,
        riskLevel: 'LOW',
        recommendation: 'APPROVE',
        findings: ['Valid document'],
        documentMetadata: { verifiedName: 'Test Corp' }
    })
}));

describe('AIService', () => {
    let mockGenAIClient: any;
    let aiService: AIService;

    beforeEach(() => {
        vi.clearAllMocks();

        // fake GoogleGenAI client with mocked nested methods
        mockGenAIClient = {
            models: {
                generateContent: vi.fn().mockResolvedValue({
                    text: '{"mocked": "response"}'
                })
            }
        };

        // Replace global fetch with a mock
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
            headers: new Headers({ 'content-type': 'application/pdf' })
        });

        aiService = new AIService(mockGenAIClient as unknown as GoogleGenAI);
    });

    it('should fetch the document, call the AI model, and return parsed results', async () => {
        const mockData = { businessName: 'Test Corp' } as any;
        const documentUrl = 'https://fake-url.com/doc.pdf';

        const result = await aiService.analyzeApplication(mockData, documentUrl);

        expect(global.fetch).toHaveBeenCalledWith(documentUrl);
        expect(mockGenAIClient.models.generateContent).toHaveBeenCalled();
        expect(result.riskLevel).toBe('LOW');
        expect(result.riskScore).toBe(20);
        expect(result.recommendation).toBe('APPROVE');
    });

    it('should throw an error if the document fetch fails', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            statusText: 'Not Found'
        });

        const mockData = { businessName: 'Test Corp' } as any;

        await expect(
            aiService.analyzeApplication(mockData, 'bad-url')
        ).rejects.toThrow(/Failed to fetch document/);
    });
});
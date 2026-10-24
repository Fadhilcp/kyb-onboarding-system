import { CreateApplicationDTO } from '../dtos/application.dto';

export const buildKybReviewPrompt = (data: CreateApplicationDTO): string => {
    const expiryString = data.registrationExpiry
        ? new Date(data.registrationExpiry).toISOString().split('T')[0]
        : 'N/A';

    return `You are a strict, automated KYB (Know Your Business) verification and compliance analyst.
        Analyze the provided business registration/incorporation document against the applicant's submitted business information.

        Applicant Data:
        - Business Name: "${data.businessName}"
        - Registration Number: "${data.registrationNumber}"
        - Registration Expiry: "${expiryString}"
        - Owner / Representative Name: "${data.ownerName}"
        - Contact Email: "${data.contactEmail}"

        Verification Instructions:
        1. Extract the official business name, registration/license number, expiry or issuance dates, and any director/officer names from the document.
        2. Cross-verify the extracted details against the applicant data (check for exact, fuzzy, or mismatch).
        3. Calculate a risk score from 0 to 100 (0 = Lowest Risk, 100 = Critical Risk).
        4. Assign a risk level: "LOW" (0-30), "MEDIUM" (31-70), or "HIGH" (71-100).
        5. Provide a recommendation: "RECOMMEND_APPROVAL", "RECOMMEND_MANUAL_REVIEW", or "RECOMMEND_REJECTION".
        6. List concise findings explaining each verification point.
        7. Return verified metadata extracted directly from the document.

        You MUST respond strictly with valid JSON following this schema:
            {
                "riskScore": number,
                "riskLevel": "LOW" | "MEDIUM" | "HIGH",
                "recommendation": string,
                "findings": string[],
                "documentMetadata": {
                    "verifiedName": string,
                    "verifiedRegistrationNumber": string
            }
        }`;
};

export const resolveDocumentMimeType = (documentUrl: string, headerContentType?: string | null): string => {
    let mimeType = headerContentType?.split(';')[0].trim();
    
    if (!mimeType || mimeType === 'application/octet-stream') {
        const lowerUrl = documentUrl.toLowerCase();
        if (lowerUrl.endsWith('.pdf')) return 'application/pdf';
        if (lowerUrl.endsWith('.png')) return 'image/png';
        if (lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg')) return 'image/jpeg';
        return 'application/pdf';
    }
    
    return mimeType;
};

export const cleanAndParseAiJson = (text: string): any => {
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText
        .replace(/^```(?:json)?\n?/, '')
        .replace(/\n?```$/, '')
        .trim();
    }
    return JSON.parse(cleanedText);
};
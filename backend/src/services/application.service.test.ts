import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApplicationService } from './application.service.js';
import { ApplicationStatus } from '@prisma/client';

// Mock Cloudinary and FS so we don't actually upload or delete files during tests
vi.mock('../config/cloudinary.js', () => ({
    default: {
        uploader: {
            upload: vi.fn().mockResolvedValue({ secure_url: 'https://cloudinary.com/fake.pdf' })
        }
    }
}));

vi.mock('fs', () => ({
    default: {
        existsSync: vi.fn().mockReturnValue(true),
        unlinkSync: vi.fn()
    }
}));

describe('ApplicationService', () => {
    let applicationRepositoryMock: any;
    let aiServiceMock: any;
    let applicationService: ApplicationService;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock Repository
        applicationRepositoryMock = {
            create: vi.fn(),
            findById: vi.fn(),
            updateStatus: vi.fn(),
            findManyByStatus: vi.fn(),
        };

        // Mock AI Service
        aiServiceMock = {
            analyzeApplication: vi.fn(),
        };

        applicationService = new ApplicationService(
            applicationRepositoryMock,
            aiServiceMock
        );
    });

    it('should submit an application and trigger background AI processing', async () => {
        const mockDto = { businessName: 'Test Corp', documentUrl: '' } as any;
        applicationRepositoryMock.create.mockResolvedValue({ id: 'app_1', status: ApplicationStatus.SUBMITTED });

        aiServiceMock.analyzeApplication.mockResolvedValue({ riskLevel: 'LOW' });
        
        const result = await applicationService.submitApplication(mockDto, 'local/path/doc.pdf');

        expect(applicationRepositoryMock.create).toHaveBeenCalled();
        expect(result.status).toBe(ApplicationStatus.SUBMITTED);
    });

    it('should throw an error when trying to update a decision on a DRAFT application', async () => {
        applicationRepositoryMock.findById.mockResolvedValue({
            id: 'app_1',
            status: ApplicationStatus.DRAFT
        });

        await expect(
            applicationService.updateDecision('app_1', ApplicationStatus.APPROVED)
        ).rejects.toThrow(/Cannot approve or reject an application in DRAFT status/);
    });

    it('should throw an error when trying to update an already APPROVED application', async () => {
        applicationRepositoryMock.findById.mockResolvedValue({
            id: 'app_2',
            status: ApplicationStatus.APPROVED
        });

        await expect(
            applicationService.updateDecision('app_2', ApplicationStatus.REJECTED)
        ).rejects.toThrow(/has already been finalized/);
    });

    it('should successfully update the decision to APPROVED if status is valid', async () => {
        applicationRepositoryMock.findById.mockResolvedValue({
            id: 'app_3',
            status: ApplicationStatus.AI_REVIEWED
        });
        applicationRepositoryMock.updateStatus.mockResolvedValue({
            id: 'app_3',
            status: ApplicationStatus.APPROVED
        });

        const result = await applicationService.updateDecision('app_3', ApplicationStatus.APPROVED);

        expect(applicationRepositoryMock.updateStatus).toHaveBeenCalledWith('app_3', ApplicationStatus.APPROVED);
        expect(result.status).toBe(ApplicationStatus.APPROVED);
    });
});
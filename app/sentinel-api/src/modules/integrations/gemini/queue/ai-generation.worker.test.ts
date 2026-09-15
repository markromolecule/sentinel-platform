import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AiGenerationWorkerProcessor, type AiGenerationJobData } from './ai-generation.worker';
import { AiJobFileStagingService } from '../services/ai-job-file-staging.service';
import { AiGenerationJobRepository } from '../data/ai-generation-job.repository';
import { QuestionGeneratorService } from '../../../../lib/gemini/services/question-generator';

describe('AiGenerationWorkerProcessor', () => {
    const mockData: AiGenerationJobData = {
        jobId: 'test-worker-job-1',
        userId: 'user-1',
        institutionId: 'inst-1',
        config: {
            questionCount: 10,
            promptType: 'lesson',
            difficultyDistribution: { Easy: 5, Medium: 5 },
            cognitiveDistribution: { Remembering: 5, Understanding: 5 },
            questionTypes: ['multiple_choice'],
        },
    };

    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(AiGenerationJobRepository, 'updateProgress').mockResolvedValue();
        vi.spyOn(AiGenerationJobRepository, 'completeJob').mockResolvedValue();
        vi.spyOn(AiGenerationJobRepository, 'failJob').mockResolvedValue();
    });

    it('processes job end-to-end and cleans up files upon completion', async () => {
        const dummyFile = new File([Buffer.from('pdf data')], 'test.pdf', { type: 'application/pdf' });
        vi.spyOn(AiJobFileStagingService, 'loadStagedFiles').mockResolvedValue([dummyFile]);
        const cleanupSpy = vi.spyOn(AiJobFileStagingService, 'cleanupJobFiles').mockResolvedValue();

        const updateProgressSpy = vi.spyOn(AiGenerationJobRepository, 'updateProgress').mockResolvedValue();
        const completeJobSpy = vi.spyOn(AiGenerationJobRepository, 'completeJob').mockResolvedValue();

        const mockResponse: any = {
            questions: [{ id: 'q-1', text: 'Sample Question' }],
            sourceDocuments: [],
            warnings: [],
            telemetry: {},
        };

        vi.spyOn(QuestionGeneratorService, 'generatePreviewFromPdf').mockImplementation(async (args) => {
            if (args.onProgress) {
                await args.onProgress(50, 'Halfway done');
            }
            return mockResponse;
        });

        await AiGenerationWorkerProcessor.processJob(mockData);

        expect(updateProgressSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'test-worker-job-1',
                progress: 5,
            }),
        );
        expect(updateProgressSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'test-worker-job-1',
                progress: 50,
                currentStep: 'Halfway done',
            }),
        );
        expect(completeJobSpy).toHaveBeenCalledWith({
            id: 'test-worker-job-1',
            result: mockResponse,
        });
        expect(cleanupSpy).toHaveBeenCalledWith('test-worker-job-1');
    });

    it('fails job and cleans up files if staged files are missing', async () => {
        vi.spyOn(AiJobFileStagingService, 'loadStagedFiles').mockResolvedValue([]);
        const cleanupSpy = vi.spyOn(AiJobFileStagingService, 'cleanupJobFiles').mockResolvedValue();
        const failJobSpy = vi.spyOn(AiGenerationJobRepository, 'failJob').mockResolvedValue();

        await AiGenerationWorkerProcessor.processJob(mockData);

        expect(failJobSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'test-worker-job-1',
                error: expect.stringContaining('No staged document files found'),
            }),
        );
        expect(cleanupSpy).toHaveBeenCalledWith('test-worker-job-1');
    });

    it('cleans up disk and records failure if generation throws error', async () => {
        const dummyFile = new File([Buffer.from('pdf data')], 'test.pdf', { type: 'application/pdf' });
        vi.spyOn(AiJobFileStagingService, 'loadStagedFiles').mockResolvedValue([dummyFile]);
        const cleanupSpy = vi.spyOn(AiJobFileStagingService, 'cleanupJobFiles').mockResolvedValue();
        const failJobSpy = vi.spyOn(AiGenerationJobRepository, 'failJob').mockResolvedValue();

        vi.spyOn(QuestionGeneratorService, 'generatePreviewFromPdf').mockRejectedValue(
            new Error('Gemini upstream network reset'),
        );

        await expect(AiGenerationWorkerProcessor.processJob(mockData)).rejects.toThrow(
            'Gemini upstream network reset',
        );

        expect(failJobSpy).toHaveBeenCalledWith({
            id: 'test-worker-job-1',
            error: 'Gemini upstream network reset',
        });
        expect(cleanupSpy).toHaveBeenCalledWith('test-worker-job-1');
    });
});

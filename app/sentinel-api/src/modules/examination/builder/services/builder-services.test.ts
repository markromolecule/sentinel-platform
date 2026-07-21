import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildBuilderWorkspace } from './build-builder-workspace.service';
import { getBuilderWorkspaceService } from './get-builder-workspace.service';
import { saveBuilderWorkspaceService } from './save-builder-workspace.service';
import { publishBuilderWorkspaceService } from './publish-builder-workspace.service';
import { ExamService } from '../../exams/exam.service';
import { QuestionTypeService } from '../../../content/question-type/question-type.service';
import { LogsService } from '../../../general/logs/logs.service';
import { ActivityNotificationService } from '../../../general/notification/services/activity-notification.service';
import { incrementQuestionUsageData } from '../../../content/question-bank/data/increment-question-usage';
import { checkExposureThreshold } from '../../../content/question-bank/services/check-exposure-threshold.service';

vi.mock('../../exams/exam.service', () => ({
    ExamService: {
        getExamById: vi.fn(),
        updateExam: vi.fn(),
        updateExamStatus: vi.fn(),
    },
}));

vi.mock('../../../content/question-type/question-type.service', () => ({
    QuestionTypeService: {
        getQuestionTypes: vi.fn(() => ['multiple-choice']),
    },
}));

vi.mock('../../../general/logs/logs.service', () => ({
    LogsService: {
        createLog: vi.fn(),
    },
}));

vi.mock('../../../general/notification/services/activity-notification.service', () => ({
    ActivityNotificationService: {
        notifyInstitutionActivityCreated: vi.fn(),
    },
}));

vi.mock('../../../content/question-bank/data/increment-question-usage', () => ({
    incrementQuestionUsageData: vi.fn(),
}));

vi.mock('../../../content/question-bank/services/check-exposure-threshold.service', () => ({
    checkExposureThreshold: vi.fn(),
}));

describe('Builder Modular Services', () => {
    const mockDbClient = {} as any;
    const mockExam = {
        exam_id: 'exam-123',
        title: 'Math Exam',
        institution_id: 'inst-1',
        questions: [
            { sourceQuestionBankQuestionId: 'qbq-1' },
            { sourceQuestionBankQuestionId: 'qbq-2' },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('buildBuilderWorkspace', () => {
        it('builds workspace containing the exam and question types', () => {
            const workspace = buildBuilderWorkspace(mockExam as any);
            expect(workspace).toEqual({
                exam: mockExam,
                questionTypes: ['multiple-choice'],
            });
            expect(QuestionTypeService.getQuestionTypes).toHaveBeenCalled();
        });
    });

    describe('getBuilderWorkspaceService', () => {
        it('fetches exam and returns the workspace', async () => {
            vi.mocked(ExamService.getExamById).mockResolvedValue(mockExam as any);

            const workspace = await getBuilderWorkspaceService({
                dbClient: mockDbClient,
                examId: 'exam-123',
                institutionId: 'inst-1',
            });

            expect(ExamService.getExamById).toHaveBeenCalledWith(
                mockDbClient,
                'exam-123',
                'inst-1',
            );
            expect(workspace.exam).toEqual(mockExam);
        });
    });

    describe('saveBuilderWorkspaceService', () => {
        it('updates exam, logs telemetry, and returns the workspace', async () => {
            vi.mocked(ExamService.updateExam).mockResolvedValue(mockExam as any);

            const body = { title: 'Updated Math Exam' } as any;
            const workspace = await saveBuilderWorkspaceService({
                dbClient: mockDbClient,
                examId: 'exam-123',
                body,
                institutionId: 'inst-1',
                userId: 'user-1',
            });

            expect(ExamService.updateExam).toHaveBeenCalledWith(
                mockDbClient,
                'exam-123',
                body,
                'inst-1',
                'user-1',
                false,
                false,
                undefined,
            );
            expect(LogsService.createLog).toHaveBeenCalledWith(mockDbClient, {
                userId: 'user-1',
                action: 'exam.builder_saved',
                resourceType: 'exam',
                resourceId: 'exam-123',
                activeInstitutionId: 'inst-1',
                details: { examId: 'exam-123' },
            });
            expect(workspace.exam).toEqual(mockExam);
        });
    });

    describe('publishBuilderWorkspaceService', () => {
        it('publishes exam status, increments question usage, triggers log/notifications and returns workspace', async () => {
            vi.mocked(ExamService.updateExamStatus).mockResolvedValue(mockExam as any);

            const workspace = await publishBuilderWorkspaceService({
                dbClient: mockDbClient,
                examId: 'exam-123',
                institutionId: 'inst-1',
                userId: 'user-1',
            });

            expect(ExamService.updateExamStatus).toHaveBeenCalledWith(
                mockDbClient,
                'exam-123',
                'published',
                'inst-1',
                'user-1',
            );
            expect(incrementQuestionUsageData).toHaveBeenCalledWith({
                dbClient: mockDbClient,
                questionIds: ['qbq-1', 'qbq-2'],
            });
            expect(checkExposureThreshold).toHaveBeenCalledWith({
                dbClient: mockDbClient,
                questionIds: ['qbq-1', 'qbq-2'],
            });
            expect(LogsService.createLog).toHaveBeenCalledWith(mockDbClient, {
                userId: 'user-1',
                action: 'exam.builder_published',
                resourceType: 'exam',
                resourceId: 'exam-123',
                activeInstitutionId: 'inst-1',
                details: { examId: 'exam-123' },
            });
            expect(ActivityNotificationService.notifyInstitutionActivityCreated).toHaveBeenCalled();
            expect(workspace.exam).toEqual(mockExam);
        });
    });
});

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createExam } from './create-exam.service';
import { executeExamTransaction } from './execute-exam-transaction.service';
import { createExamData } from '../data/create-exam';
import { createExamSectionAssignmentsBatch } from '../../section-assignments/data/create-exam-section-assignments-batch';
import { syncExamAssignmentSummary } from '../../section-assignments/data/sync-exam-assignment-summary';
import { getExamDetail } from './get-exam-detail.service';
import { resolveInstructorExamAssignmentTargets } from './resolve-classroom-assignment.service';
import { assertExamScheduleWindow } from './assert-exam-schedule-window.service';
import { assertRoomBelongsToInstitution } from './assert-room-belongs-to-institution.service';
import { assertExamRoomAvailability } from './assert-exam-room-availability.service';
import { saveExamConfiguration } from '../../configuration/configuration.service';
import { replaceExamAssignedSectionsData } from '../data/replace-exam-assigned-sections';
import { replaceExamSectionsData } from '../data/replace-exam-sections';
import { replaceExamQuestionsData } from '../data/replace-exam-questions';
import { updateExamData } from '../data/update-exam';
import { recalculateRoomStatus } from '../../../core/rooms/services/recalculate-room-status';
import { getExamColumnSupport, getExamQuestionColumnSupport } from '../helper/exam-schema-compat';

vi.mock('../../../general/logs/logs.service', () => ({
    LogsService: {
        createLog: vi.fn(),
    },
}));

vi.mock('./execute-exam-transaction.service', () => ({
    executeExamTransaction: vi.fn((callback) => callback('mock-trx')),
}));

vi.mock('../data/create-exam', () => ({
    createExamData: vi.fn(),
}));

vi.mock('../../section-assignments/data/create-exam-section-assignments-batch', () => ({
    createExamSectionAssignmentsBatch: vi.fn(),
}));

vi.mock('../../section-assignments/data/sync-exam-assignment-summary', () => ({
    syncExamAssignmentSummary: vi.fn(),
}));

vi.mock('./get-exam-detail.service', () => ({
    getExamDetail: vi.fn(),
}));

vi.mock('./resolve-classroom-assignment.service', async () => {
    const actual = await vi.importActual<any>('./resolve-classroom-assignment.service');
    return {
        ...actual,
        resolveInstructorExamAssignmentTargets: vi.fn(),
        resolveInstructorLegacyExamAssignment: vi.fn(),
    };
});

vi.mock('./assert-exam-schedule-window.service', () => ({
    assertExamScheduleWindow: vi.fn(),
}));

vi.mock('./assert-room-belongs-to-institution.service', () => ({
    assertRoomBelongsToInstitution: vi.fn(),
}));

vi.mock('./assert-exam-room-availability.service', () => ({
    assertExamRoomAvailability: vi.fn(),
}));

vi.mock('../../configuration/configuration.service', () => ({
    saveExamConfiguration: vi.fn(),
}));

vi.mock('../data/replace-exam-assigned-sections.ts', () => ({
    replaceExamAssignedSectionsData: vi.fn(),
}));

vi.mock('../data/replace-exam-sections.ts', () => ({
    replaceExamSectionsData: vi.fn(),
}));

vi.mock('../data/replace-exam-questions.ts', () => ({
    replaceExamQuestionsData: vi.fn(),
}));

vi.mock('../data/update-exam.ts', () => ({
    updateExamData: vi.fn(),
}));

vi.mock('../../../core/rooms/services/recalculate-room-status', () => ({
    recalculateRoomStatus: vi.fn(),
}));

vi.mock('../helper/exam-schema-compat', () => ({
    getExamColumnSupport: vi
        .fn()
        .mockResolvedValue({ hasSectionId: true, hasSectionName: true, hasRoomId: true }),
    getExamQuestionColumnSupport: vi.fn().mockResolvedValue({ hasSourceCollectionId: true }),
}));

describe('createExam service with assignment sync', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates an exam and persists section assignments transactionally', async () => {
        const mockDb = {} as any;
        const mockBody = {
            title: 'Test Exam',
            description: 'This is a description with twenty plus chars.',
            isPublic: false,
            classroomId: 'classroom-1',
            roomId: 'room-1',
            startDateTime: '2026-06-14T08:00:00Z',
            endDateTime: '2026-06-14T09:00:00Z',
            durationMinutes: 60,
            passingScore: 75,
            shuffleQuestions: true,
            showCorrectAnswers: false,
            allowReview: true,
            randomizeChoices: true,
            instructorId: 'inst-1',
            instructorIds: ['inst-1'],
        };

        vi.mocked(resolveInstructorExamAssignmentTargets).mockResolvedValue({
            classroomAssignment: {
                classGroupId: 'class-group-1',
                className: 'Class A',
                institutionId: 'inst-1',
                subjectId: 'sub-1',
                subjectTitle: 'Subject 1',
                sectionId: 'sec-1',
                sectionName: 'Section 1',
            },
            assignedSectionIds: [],
            resolvedClassrooms: [
                {
                    classGroupId: 'class-group-1',
                    className: 'Class A',
                    institutionId: 'inst-1',
                    subjectId: 'sub-1',
                    subjectTitle: 'Subject 1',
                    sectionId: 'sec-1',
                    sectionName: 'Section 1',
                },
            ],
        });

        vi.mocked(createExamData).mockResolvedValue({ exam_id: 'exam-1' } as any);
        vi.mocked(getExamDetail).mockResolvedValue({
            id: 'exam-1',
            title: 'Test Exam',
            classroomIds: ['classroom-1'],
            assignedRoomNames: ['Room A'],
        } as any);

        const result = await createExam(mockDb, mockBody as any, 'inst-1', 'user-1');

        expect(resolveInstructorExamAssignmentTargets).toHaveBeenCalled();
        expect(createExamData).toHaveBeenCalled();
        expect(createExamSectionAssignmentsBatch).toHaveBeenCalledWith({
            dbClient: 'mock-trx',
            examId: 'exam-1',
            assignments: [
                {
                    sectionId: 'sec-1',
                    classGroupId: 'class-group-1',
                    roomId: 'room-1',
                    instructorId: 'inst-1',
                    scheduledAt: '2026-06-14T08:00:00Z',
                },
            ],
        });
        expect(syncExamAssignmentSummary).toHaveBeenCalledWith({
            dbClient: 'mock-trx',
            examId: 'exam-1',
        });
        expect(recalculateRoomStatus).toHaveBeenCalledWith('mock-trx', 'room-1');
        const { LogsService } = await import('../../../general/logs/logs.service');
        expect(LogsService.createLog).toHaveBeenCalled();
        expect(result).toEqual({
            id: 'exam-1',
            title: 'Test Exam',
            classroomIds: ['classroom-1'],
            assignedRoomNames: ['Room A'],
        });
    });

    it('persists section assignments for public classroom exams too', async () => {
        const mockDb = {} as any;
        const mockBody = {
            title: 'Public Classroom Exam',
            description: 'This public exam still needs classroom assignment rows.',
            isPublic: true,
            classroomId: 'classroom-1',
            roomId: 'room-1',
            startDateTime: '2026-06-14T08:00:00Z',
            endDateTime: '2026-06-14T09:00:00Z',
            durationMinutes: 60,
            passingScore: 75,
            instructorId: 'inst-1',
            instructorIds: ['inst-1'],
        };

        vi.mocked(resolveInstructorExamAssignmentTargets).mockResolvedValue({
            classroomAssignment: {
                classGroupId: 'class-group-1',
                className: 'Class A',
                institutionId: 'inst-1',
                subjectId: 'sub-1',
                subjectTitle: 'Subject 1',
                sectionId: 'sec-1',
                sectionName: 'Section 1',
            },
            assignedSectionIds: [],
            resolvedClassrooms: [
                {
                    classGroupId: 'class-group-1',
                    className: 'Class A',
                    institutionId: 'inst-1',
                    subjectId: 'sub-1',
                    subjectTitle: 'Subject 1',
                    sectionId: 'sec-1',
                    sectionName: 'Section 1',
                },
            ],
        });
        vi.mocked(createExamData).mockResolvedValue({ exam_id: 'exam-2' } as any);
        vi.mocked(getExamDetail).mockResolvedValue({
            id: 'exam-2',
            title: 'Public Classroom Exam',
        } as any);

        await createExam(mockDb, mockBody as any, 'inst-1', 'user-1');

        expect(createExamSectionAssignmentsBatch).toHaveBeenCalledWith({
            dbClient: 'mock-trx',
            examId: 'exam-2',
            assignments: [
                {
                    sectionId: 'sec-1',
                    classGroupId: 'class-group-1',
                    roomId: 'room-1',
                    instructorId: 'inst-1',
                    scheduledAt: '2026-06-14T08:00:00Z',
                },
            ],
        });
        expect(syncExamAssignmentSummary).toHaveBeenCalledWith({
            dbClient: 'mock-trx',
            examId: 'exam-2',
        });
    });

    it('persists null passing_score when create payload inherits the global default', async () => {
        const mockDb = {} as any;
        const mockBody = {
            title: 'Inherited Passing Score Exam',
            description: 'This exam inherits the support-managed passing score baseline.',
            classroomId: 'classroom-1',
            startDateTime: '2026-06-14T08:00:00Z',
            endDateTime: '2026-06-14T09:00:00Z',
            durationMinutes: 60,
        };

        vi.mocked(resolveInstructorExamAssignmentTargets).mockResolvedValue({
            classroomAssignment: {
                classGroupId: 'class-group-1',
                className: 'Class A',
                institutionId: 'inst-1',
                subjectId: 'sub-1',
                subjectTitle: 'Subject 1',
                sectionId: 'sec-1',
                sectionName: 'Section 1',
            },
            assignedSectionIds: [],
            resolvedClassrooms: [],
        });
        vi.mocked(createExamData).mockResolvedValue({ exam_id: 'exam-1' } as any);
        vi.mocked(getExamDetail).mockResolvedValue({ id: 'exam-1' } as any);

        await createExam(mockDb, mockBody as any, 'inst-1', 'user-1');

        expect(vi.mocked(createExamData).mock.calls[0]?.[0]?.values?.passing_score).toBeNull();
    });

    it('persists explicit passing_score overrides during create', async () => {
        const mockDb = {} as any;
        const mockBody = {
            title: 'Explicit Passing Score Exam',
            description: 'This exam intentionally overrides the inherited passing score baseline.',
            classroomId: 'classroom-1',
            startDateTime: '2026-06-14T08:00:00Z',
            endDateTime: '2026-06-14T09:00:00Z',
            durationMinutes: 60,
            passingScore: 75,
        };

        vi.mocked(resolveInstructorExamAssignmentTargets).mockResolvedValue({
            classroomAssignment: {
                classGroupId: 'class-group-1',
                className: 'Class A',
                institutionId: 'inst-1',
                subjectId: 'sub-1',
                subjectTitle: 'Subject 1',
                sectionId: 'sec-1',
                sectionName: 'Section 1',
            },
            assignedSectionIds: [],
            resolvedClassrooms: [],
        });
        vi.mocked(createExamData).mockResolvedValue({ exam_id: 'exam-1' } as any);
        vi.mocked(getExamDetail).mockResolvedValue({ id: 'exam-1' } as any);

        await createExam(mockDb, mockBody as any, 'inst-1', 'user-1');

        expect(vi.mocked(createExamData).mock.calls[0]?.[0]?.values?.passing_score).toBe(75);
    });
});

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { updateExam } from './update-exam.service';
import { executeExamTransaction } from './execute-exam-transaction.service';
import { getExamByIdData } from '../data/get-exam-by-id';
import { updateExamData } from '../data/update-exam';
import { deleteAllExamSectionAssignments } from '../../section-assignments/data/delete-all-exam-section-assignments';
import { createExamSectionAssignmentsBatch } from '../../section-assignments/data/create-exam-section-assignments-batch';
import { syncExamAssignmentSummary } from '../../section-assignments/data/sync-exam-assignment-summary';
import { getExamDetail } from './get-exam-detail.service';
import { resolveInstructorExamAssignmentTargets } from './resolve-classroom-assignment.service';
import { assertExamScheduleWindow } from './assert-exam-schedule-window.service';
import { assertRoomBelongsToInstitution } from './assert-room-belongs-to-institution.service';
import { assertExamRoomAvailability } from './assert-exam-room-availability.service';
import { recalculateRoomStatus } from '../../../core/rooms/services/recalculate-room-status';
import { getExamColumnSupport, getExamQuestionColumnSupport } from '../helper/exam-schema-compat';

const mockTrx = {
    deleteFrom: vi.fn().mockReturnThis(),
    insertInto: vi.fn().mockReturnThis(),
    updateTable: vi.fn().mockReturnThis(),
    selectFrom: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue([]),
};

vi.mock('./execute-exam-transaction.service', () => ({
    executeExamTransaction: vi.fn((callback) => callback(mockTrx)),
}));

vi.mock('../data/replace-exam-assigned-sections', () => ({
    replaceExamAssignedSectionsData: vi.fn(),
}));

vi.mock('../data/replace-exam-sections', () => ({
    replaceExamSectionsData: vi.fn(),
}));

vi.mock('../data/replace-exam-questions', () => ({
    replaceExamQuestionsData: vi.fn(),
}));

vi.mock('../data/get-exam-by-id', () => ({
    getExamByIdData: vi.fn(),
}));

vi.mock('../data/update-exam', () => ({
    updateExamData: vi.fn(),
}));

vi.mock('../../section-assignments/data/delete-all-exam-section-assignments', () => ({
    deleteAllExamSectionAssignments: vi.fn(),
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

vi.mock('../../../core/rooms/services/recalculate-room-status', () => ({
    recalculateRoomStatus: vi.fn(),
}));

vi.mock('../helper/exam-schema-compat', () => ({
    getExamColumnSupport: vi
        .fn()
        .mockResolvedValue({ hasSectionId: true, hasSectionName: true, hasRoomId: true }),
    getExamQuestionColumnSupport: vi.fn().mockResolvedValue({ hasSourceCollectionId: true }),
}));

vi.mock('../../../general/logs/logs.service', () => ({
    LogsService: {
        createLog: vi.fn(),
    },
}));

describe('updateExam service with assignment sync', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockCurrentExam = {
        exam_id: 'exam-1',
        title: 'Original Title',
        description: 'Original description with more than twenty characters.',
        created_by: 'user-1',
        institution_id: 'inst-1',
        class_group_id: 'class-group-1',
        section_id: 'sec-1',
        room_id: 'room-1',
        scheduled_date: new Date('2026-06-14T08:00:00Z'),
        end_date_time: new Date('2026-06-14T09:00:00Z'),
    };

    it('updates assignments when classroom or section changes', async () => {
        const mockDb = {} as any;
        const mockBody = {
            classroomId: 'classroom-2',
            sectionIds: ['sec-2'],
            roomId: 'room-2',
        };

        vi.mocked(getExamByIdData).mockResolvedValue(mockCurrentExam as any);
        vi.mocked(resolveInstructorExamAssignmentTargets).mockResolvedValue({
            classroomAssignment: {
                classGroupId: 'class-group-2',
                className: 'Class B',
                institutionId: 'inst-1',
                subjectId: 'sub-1',
                subjectTitle: 'Subject 1',
                sectionId: 'sec-2',
                sectionName: 'Section 2',
            },
            assignedSectionIds: [],
            resolvedClassrooms: [
                {
                    classGroupId: 'class-group-2',
                    className: 'Class B',
                    institutionId: 'inst-1',
                    subjectId: 'sub-1',
                    subjectTitle: 'Subject 1',
                    sectionId: 'sec-2',
                    sectionName: 'Section 2',
                },
            ],
        });
        vi.mocked(updateExamData).mockResolvedValue(mockCurrentExam as any);
        vi.mocked(getExamDetail).mockResolvedValue({ id: 'exam-1' } as any);

        await updateExam(mockDb, 'exam-1', mockBody as any, 'inst-1', 'user-1');

        expect(deleteAllExamSectionAssignments).toHaveBeenCalledWith({
            dbClient: mockTrx,
            examId: 'exam-1',
        });
        expect(createExamSectionAssignmentsBatch).toHaveBeenCalledWith({
            dbClient: mockTrx,
            examId: 'exam-1',
            assignments: [
                {
                    sectionId: 'sec-2',
                    classGroupId: 'class-group-2',
                    roomId: 'room-2',
                    instructorId: 'user-1',
                    scheduledAt: mockCurrentExam.scheduled_date.toISOString(),
                },
            ],
        });
        expect(syncExamAssignmentSummary).toHaveBeenCalledWith({
            dbClient: mockTrx,
            examId: 'exam-1',
        });
        expect(recalculateRoomStatus).toHaveBeenCalledWith(
            mockTrx,
            expect.arrayContaining(['room-1', 'room-2']),
        );
    });

    it('does not touch assignments when unrelated fields change', async () => {
        const mockDb = {} as any;
        const mockBody = {
            title: 'Updated Exam Title',
        };

        vi.mocked(getExamByIdData).mockResolvedValue(mockCurrentExam as any);
        vi.mocked(updateExamData).mockResolvedValue(mockCurrentExam as any);
        vi.mocked(getExamDetail).mockResolvedValue({ id: 'exam-1' } as any);

        await updateExam(mockDb, 'exam-1', mockBody as any, 'inst-1', 'user-1');

        expect(deleteAllExamSectionAssignments).not.toHaveBeenCalled();
        expect(createExamSectionAssignmentsBatch).not.toHaveBeenCalled();
        expect(syncExamAssignmentSummary).not.toHaveBeenCalled();
    });

    it('clears assignments when classroomId is updated to null', async () => {
        const mockDb = {} as any;
        const mockBody = {
            classroomId: null,
        };

        vi.mocked(getExamByIdData).mockResolvedValue(mockCurrentExam as any);
        vi.mocked(updateExamData).mockResolvedValue(mockCurrentExam as any);
        vi.mocked(getExamDetail).mockResolvedValue({ id: 'exam-1' } as any);

        await updateExam(mockDb, 'exam-1', mockBody as any, 'inst-1', 'user-1');

        expect(deleteAllExamSectionAssignments).toHaveBeenCalledWith({
            dbClient: mockTrx,
            examId: 'exam-1',
        });
        expect(createExamSectionAssignmentsBatch).not.toHaveBeenCalled();
        expect(syncExamAssignmentSummary).toHaveBeenCalledWith({
            dbClient: mockTrx,
            examId: 'exam-1',
        });
    });
});

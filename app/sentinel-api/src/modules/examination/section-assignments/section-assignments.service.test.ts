import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SectionAssignmentsService } from './section-assignments.service';
import { createExamSectionAssignment } from './data/create-exam-section-assignment';
import { createExamSectionAssignmentsBatch } from './data/create-exam-section-assignments-batch';
import { updateExamSectionAssignment } from './data/update-exam-section-assignment';
import { deleteExamSectionAssignment } from './data/delete-exam-section-assignment';
import { syncExamAssignmentSummary } from './data/sync-exam-assignment-summary';

vi.mock('./data/create-exam-section-assignment', () => ({
    createExamSectionAssignment: vi.fn(),
}));

vi.mock('./data/create-exam-section-assignments-batch', () => ({
    createExamSectionAssignmentsBatch: vi.fn(),
}));

vi.mock('./data/update-exam-section-assignment', () => ({
    updateExamSectionAssignment: vi.fn(),
}));

vi.mock('./data/delete-exam-section-assignment', () => ({
    deleteExamSectionAssignment: vi.fn(),
}));

vi.mock('./data/sync-exam-assignment-summary', () => ({
    syncExamAssignmentSummary: vi.fn(),
}));

describe('SectionAssignmentsService', () => {
    const dbClient = {} as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('syncs the exam row after creating a single assignment', async () => {
        vi.mocked(createExamSectionAssignment).mockResolvedValue({ id: 'assignment-1' } as any);

        await SectionAssignmentsService.createExamSectionAssignment({
            dbClient,
            examId: 'exam-1',
            body: {
                sectionId: 'section-1',
                classGroupId: 'classroom-1',
                roomId: 'room-1',
            } as any,
        });

        expect(syncExamAssignmentSummary).toHaveBeenCalledWith({
            dbClient,
            examId: 'exam-1',
        });
    });

    it('syncs the exam row after creating batch assignments', async () => {
        vi.mocked(createExamSectionAssignmentsBatch).mockResolvedValue([
            { id: 'assignment-1' },
        ] as any);

        await SectionAssignmentsService.createExamSectionAssignmentsBatch({
            dbClient,
            examId: 'exam-1',
            body: {
                assignments: [
                    {
                        sectionId: '11111111-1111-4111-8111-111111111111',
                        classGroupId: '22222222-2222-4222-8222-222222222222',
                        roomId: '33333333-3333-4333-8333-333333333333',
                        instructorId: '44444444-4444-4444-4444-444444444444',
                    },
                ],
            } as any,
        });

        expect(syncExamAssignmentSummary).toHaveBeenCalledWith({
            dbClient,
            examId: 'exam-1',
        });
    });

    it('syncs the exam row after updating an assignment', async () => {
        vi.mocked(updateExamSectionAssignment).mockResolvedValue({ id: 'assignment-1' } as any);

        await SectionAssignmentsService.updateExamSectionAssignment({
            dbClient,
            id: 'assignment-1',
            examId: 'exam-1',
            body: {
                roomId: 'room-1',
            } as any,
        });

        expect(syncExamAssignmentSummary).toHaveBeenCalledWith({
            dbClient,
            examId: 'exam-1',
        });
    });

    it('syncs the exam row after deleting an assignment', async () => {
        vi.mocked(deleteExamSectionAssignment).mockResolvedValue('assignment-1');

        await SectionAssignmentsService.deleteExamSectionAssignment({
            dbClient,
            id: 'assignment-1',
            examId: 'exam-1',
        });

        expect(syncExamAssignmentSummary).toHaveBeenCalledWith({
            dbClient,
            examId: 'exam-1',
        });
    });
});

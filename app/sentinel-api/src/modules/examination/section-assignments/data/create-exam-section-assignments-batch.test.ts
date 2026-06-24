import { describe, expect, it, vi } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { createExamSectionAssignmentsBatch } from './create-exam-section-assignments-batch';

function createInsertBuilder(result: unknown) {
    return {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(result),
    };
}

function createSelectBuilder(result: unknown) {
    return {
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(result),
    };
}

describe('createExamSectionAssignmentsBatch', () => {
    it('persists class_group_id alongside section_id for new assignments', async () => {
        const insertBuilder = createInsertBuilder([{ id: 'assignment-1' }]);
        const selectBuilder = createSelectBuilder([
            {
                id: 'assignment-1',
                examId: 'exam-1',
                sectionId: 'section-1',
                classGroupId: 'classroom-1',
                sectionName: 'Section A',
                roomId: null,
                roomName: null,
                instructorId: null,
                instructorName: null,
                scheduledAt: null,
                createdAt: null,
                updatedAt: null,
            },
        ]);
        const dbClient = {
            insertInto: vi.fn().mockReturnValue(insertBuilder),
            selectFrom: vi.fn().mockReturnValue(selectBuilder),
        } as unknown as DbClient;

        const result = await createExamSectionAssignmentsBatch({
            dbClient,
            examId: 'exam-1',
            assignments: [
                {
                    sectionId: 'section-1',
                    classGroupId: 'classroom-1',
                },
            ],
        });

        expect(insertBuilder.values).toHaveBeenCalledWith([
            expect.objectContaining({
                exam_id: 'exam-1',
                section_id: 'section-1',
                class_group_id: 'classroom-1',
            }),
        ]);
        expect(result[0]).toMatchObject({
            sectionId: 'section-1',
            classGroupId: 'classroom-1',
        });
    });
});

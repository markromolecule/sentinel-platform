import { describe, expect, it, vi } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { getExamSectionAssignments } from './get-exam-section-assignments';

function createSelectBuilder(result: unknown) {
    return {
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue(result),
    };
}

describe('getExamSectionAssignments', () => {
    it('returns classGroupId when the assignment has an exact classroom link', async () => {
        const rows = [
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
        ];
        const selectBuilder = createSelectBuilder(rows);
        const dbClient = {
            selectFrom: vi.fn().mockReturnValue(selectBuilder),
        } as unknown as DbClient;

        const result = await getExamSectionAssignments({
            dbClient,
            examId: 'exam-1',
        });

        expect(result).toEqual(rows);
    });

    it('keeps legacy section-only assignments readable when classGroupId is null', async () => {
        const rows = [
            {
                id: 'assignment-legacy',
                examId: 'exam-1',
                sectionId: 'section-legacy',
                classGroupId: null,
                sectionName: 'Legacy Section',
                roomId: null,
                roomName: null,
                instructorId: null,
                instructorName: null,
                scheduledAt: null,
                createdAt: null,
                updatedAt: null,
            },
        ];
        const selectBuilder = createSelectBuilder(rows);
        const dbClient = {
            selectFrom: vi.fn().mockReturnValue(selectBuilder),
        } as unknown as DbClient;

        const result = await getExamSectionAssignments({
            dbClient,
            examId: 'exam-1',
        });

        expect(result).toEqual(rows);
    });
});

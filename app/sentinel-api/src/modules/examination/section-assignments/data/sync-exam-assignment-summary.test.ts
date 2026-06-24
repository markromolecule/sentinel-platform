import { describe, expect, it, vi } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { syncExamAssignmentSummary } from './sync-exam-assignment-summary';

function createSelectBuilder(result: unknown) {
    return {
        innerJoin: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(result),
    };
}

function createUpdateBuilder() {
    return {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(undefined),
    };
}

describe('syncExamAssignmentSummary', () => {
    it('copies the primary assignment back onto the exam row', async () => {
        const selectBuilder = createSelectBuilder({
            class_group_id: 'classroom-1',
            section_id: 'section-1',
            section_name: 'INF231',
            room_id: 'room-1',
        });
        const updateBuilder = createUpdateBuilder();
        const dbClient = {
            selectFrom: vi.fn().mockReturnValue(selectBuilder),
            updateTable: vi.fn().mockReturnValue(updateBuilder),
        } as unknown as DbClient;

        await syncExamAssignmentSummary({
            dbClient,
            examId: 'exam-1',
        });

        expect(updateBuilder.set).toHaveBeenCalledWith(
            expect.objectContaining({
                class_group_id: 'classroom-1',
                section_id: 'section-1',
                section_name: 'INF231',
                room_id: 'room-1',
                exam_category: 'CLASSROOM',
                updated_at: expect.any(Date),
            }),
        );
        expect(updateBuilder.where).toHaveBeenCalledWith('exam_id', '=', 'exam-1');
    });

    it('clears denormalized classroom fields when no assignments remain', async () => {
        const selectBuilder = createSelectBuilder(undefined);
        const updateBuilder = createUpdateBuilder();
        const dbClient = {
            selectFrom: vi.fn().mockReturnValue(selectBuilder),
            updateTable: vi.fn().mockReturnValue(updateBuilder),
        } as unknown as DbClient;

        await syncExamAssignmentSummary({
            dbClient,
            examId: 'exam-1',
        });

        expect(updateBuilder.set).toHaveBeenCalledWith(
            expect.objectContaining({
                class_group_id: null,
                section_id: null,
                section_name: null,
                room_id: null,
                exam_category: 'CLASSROOM',
                updated_at: expect.any(Date),
            }),
        );
    });
});

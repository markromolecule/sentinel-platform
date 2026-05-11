import { describe, expect, it, vi } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { checkInLobby } from './check-in-lobby';

function createSelectBuilder(result: unknown) {
    return {
        leftJoin: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        selectAll: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(result),
    };
}

describe('checkInLobby', () => {
    it('creates a waiting admission record when instructor-gated lobby has no existing admission', async () => {
        const now = new Date('2026-04-13T05:01:00.000Z');
        vi.useFakeTimers();
        vi.setSystemTime(now);

        const examSelect = createSelectBuilder({
            exam_id: 'exam-1',
            lobby_admission_mode: 'INSTRUCTOR_GATED',
        });
        const admissionSelect = createSelectBuilder(undefined);
        const insertBuilder = {
            values: vi.fn().mockReturnThis(),
            onConflict: vi.fn().mockReturnThis(),
            returningAll: vi.fn().mockReturnThis(),
            executeTakeFirstOrThrow: vi.fn().mockResolvedValue({
                admission_id: 'admission-1',
                exam_id: 'exam-1',
                student_id: 'student-1',
                status: 'WAITING',
                checked_in_at: now,
            }),
        };
        const dbClient = {
            selectFrom: vi
                .fn()
                .mockReturnValueOnce(examSelect)
                .mockReturnValueOnce(admissionSelect),
            insertInto: vi.fn().mockReturnValue(insertBuilder),
        } as unknown as DbClient;

        const result = await checkInLobby(dbClient, 'exam-1', 'student-1');

        expect(result).toEqual({
            status: 'WAITING',
            checkedInAt: now.toISOString(),
        });
        expect(dbClient.insertInto).toHaveBeenCalledWith('exam_lobby_admissions');
        expect(insertBuilder.values).toHaveBeenCalledWith({
            exam_id: 'exam-1',
            student_id: 'student-1',
            status: 'WAITING',
            checked_in_at: now,
            decided_at: null,
        });

        vi.useRealTimers();
    });

    it('creates an approved admission record for automatic lobby mode', async () => {
        const now = new Date('2026-04-13T05:01:00.000Z');
        vi.useFakeTimers();
        vi.setSystemTime(now);

        const examSelect = createSelectBuilder({
            exam_id: 'exam-1',
            lobby_admission_mode: 'AUTOMATIC',
        });
        const admissionSelect = createSelectBuilder(undefined);
        const insertBuilder = {
            values: vi.fn().mockReturnThis(),
            onConflict: vi.fn().mockReturnThis(),
            returningAll: vi.fn().mockReturnThis(),
            executeTakeFirstOrThrow: vi.fn().mockResolvedValue({
                admission_id: 'admission-1',
                exam_id: 'exam-1',
                student_id: 'student-1',
                status: 'APPROVED',
                checked_in_at: now,
                decided_at: now,
            }),
        };
        const dbClient = {
            selectFrom: vi
                .fn()
                .mockReturnValueOnce(examSelect)
                .mockReturnValueOnce(admissionSelect),
            insertInto: vi.fn().mockReturnValue(insertBuilder),
        } as unknown as DbClient;

        const result = await checkInLobby(dbClient, 'exam-1', 'student-1');

        expect(result).toEqual({
            status: 'APPROVED',
            checkedInAt: now.toISOString(),
        });
        expect(insertBuilder.values).toHaveBeenCalledWith({
            exam_id: 'exam-1',
            student_id: 'student-1',
            status: 'APPROVED',
            checked_in_at: now,
            decided_at: now,
        });

        vi.useRealTimers();
    });

    it('does not create a duplicate admission when an instructor-gated waiting record already exists', async () => {
        const now = new Date('2026-04-13T05:01:00.000Z');
        const examSelect = createSelectBuilder({
            exam_id: 'exam-1',
            lobby_admission_mode: 'INSTRUCTOR_GATED',
        });
        const admissionSelect = createSelectBuilder({
            admission_id: 'admission-1',
            exam_id: 'exam-1',
            student_id: 'student-1',
            status: 'WAITING',
            checked_in_at: now,
            decided_at: null,
        });
        const dbClient = {
            selectFrom: vi
                .fn()
                .mockReturnValueOnce(examSelect)
                .mockReturnValueOnce(admissionSelect),
            insertInto: vi.fn(),
            updateTable: vi.fn(),
        } as unknown as DbClient;

        const result = await checkInLobby(dbClient, 'exam-1', 'student-1');

        expect(result).toEqual({
            status: 'WAITING',
            checkedInAt: now.toISOString(),
        });
        expect(dbClient.insertInto).not.toHaveBeenCalled();
        expect(dbClient.updateTable).not.toHaveBeenCalled();
    });

    it('upgrades an existing automatic waiting record to approved without inserting a new one', async () => {
        const now = new Date('2026-04-13T05:01:00.000Z');
        const examSelect = createSelectBuilder({
            exam_id: 'exam-1',
            lobby_admission_mode: 'AUTOMATIC',
        });
        const admissionSelect = createSelectBuilder({
            admission_id: 'admission-1',
            exam_id: 'exam-1',
            student_id: 'student-1',
            status: 'WAITING',
            checked_in_at: now,
            decided_at: null,
        });
        const updateBuilder = {
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            returningAll: vi.fn().mockReturnThis(),
            executeTakeFirstOrThrow: vi.fn().mockResolvedValue({
                admission_id: 'admission-1',
                exam_id: 'exam-1',
                student_id: 'student-1',
                status: 'APPROVED',
                checked_in_at: now,
                decided_at: now,
            }),
        };
        const dbClient = {
            selectFrom: vi
                .fn()
                .mockReturnValueOnce(examSelect)
                .mockReturnValueOnce(admissionSelect),
            insertInto: vi.fn(),
            updateTable: vi.fn().mockReturnValue(updateBuilder),
        } as unknown as DbClient;

        const result = await checkInLobby(dbClient, 'exam-1', 'student-1');

        expect(result).toEqual({
            status: 'APPROVED',
            checkedInAt: now.toISOString(),
        });
        expect(dbClient.insertInto).not.toHaveBeenCalled();
        expect(dbClient.updateTable).toHaveBeenCalledWith('exam_lobby_admissions');
    });
});

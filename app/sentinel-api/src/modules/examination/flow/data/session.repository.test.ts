import { describe, expect, it, vi } from 'vitest';
import type { DbClient } from '@sentinel/db';
import { SessionRepository } from './session.repository';

function createExistingAttemptSelect(result: unknown) {
    return {
        innerJoin: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(result),
    };
}

describe('SessionRepository.createSession', () => {
    it('increments reconnect_attempt_count when resuming an in-progress attempt', async () => {
        const updateBuilder = {
            set: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            execute: vi.fn().mockResolvedValue(undefined),
        };
        const dbClient = {
            selectFrom: vi.fn().mockReturnValue(
                createExistingAttemptSelect({
                    attempt_id: 'attempt-1',
                    completed_at: null,
                    status: 'IN_PROGRESS',
                    created_at: new Date('2026-04-13T05:00:00.000Z'),
                    answer_snapshot: { 'question-1': 'A' },
                    time_spent_minutes: 4,
                    reconnect_attempt_count: 0,
                }),
            ),
            updateTable: vi.fn().mockReturnValue(updateBuilder),
        } as unknown as DbClient;

        const result = await SessionRepository.createSession(dbClient, {
            examId: 'exam-1',
            studentId: 'student-1',
            maxReconnectAttempts: 3,
        });

        expect(result).toMatchObject({
            sessionId: 'attempt-1',
            isResumed: true,
            reconnectAttemptCount: 1,
            maxReconnectAttempts: 3,
            elapsedSeconds: 240,
            answers: { 'question-1': 'A' },
        });
        expect(updateBuilder.set).toHaveBeenCalledWith(
            expect.objectContaining({
                reconnect_attempt_count: 1,
            }),
        );
    });
});

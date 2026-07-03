import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DbClient } from '@sentinel/db';
import { reopenExamAttempt } from './reopen-exam-attempt';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { appendExamAttemptLifecycleEvent } from './lifecycle-event.service';

vi.mock('../data/get-lifecycle-attempt-context', () => ({
    getLifecycleAttemptContext: vi.fn(),
}));

vi.mock('./lifecycle-event.service', () => ({
    appendExamAttemptLifecycleEvent: vi.fn(),
}));

function createUpdateBuilder() {
    return {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(undefined),
    };
}

describe('reopenExamAttempt', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('updates only the selected attempt id', async () => {
        const updateBuilder = createUpdateBuilder();
        const dbClient = {
            updateTable: vi.fn().mockReturnValue(updateBuilder),
        } as unknown as DbClient;

        vi.mocked(getLifecycleAttemptContext).mockResolvedValue({
            attempt: {
                attemptId: 'attempt-1',
                examId: 'exam-1',
                studentId: 'student-1',
                lifecycleState: 'LOCKED',
                scoreState: 'DRAFT',
                events: [],
            },
            exam: {
                id: 'exam-1',
                institutionId: 'institution-1',
                scheduledDate: null,
                endDateTime: null,
                durationMinutes: 60,
            },
            student: {
                id: 'student-1',
            },
            incidents: [],
        } as any);
        vi.mocked(appendExamAttemptLifecycleEvent).mockResolvedValue({
            eventId: 'event-1',
            attemptId: 'attempt-1',
            examId: 'exam-1',
            studentId: 'student-1',
            eventType: 'REOPENED',
            previousState: 'LOCKED',
            nextState: 'IN_PROGRESS',
            actorUserId: 'actor-1',
            reasonCode: 'MANUAL_REOPEN',
            notes: null,
            relatedIncidentIds: null,
            relatedOverrideId: null,
            metadata: null,
            createdAt: new Date().toISOString(),
        });

        await reopenExamAttempt({
            dbClient,
            examId: 'exam-1',
            attemptId: 'attempt-1',
            reopenedUntil: new Date(Date.now() + 60_000).toISOString(),
            actorUserId: 'actor-1',
        });

        expect(updateBuilder.where).toHaveBeenNthCalledWith(1, 'attempt_id', '=', 'attempt-1');
        expect(updateBuilder.where).toHaveBeenNthCalledWith(2, 'exam_id', '=', 'exam-1');
    });
});

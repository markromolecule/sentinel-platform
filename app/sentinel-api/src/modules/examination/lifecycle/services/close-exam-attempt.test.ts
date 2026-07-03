import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DbClient } from '@sentinel/db';
import { closeExamAttempt } from './close-exam-attempt';
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

describe('closeExamAttempt', () => {
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
                lifecycleState: 'IN_PROGRESS',
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
            eventType: 'CLOSED',
            previousState: 'IN_PROGRESS',
            nextState: 'CLOSED',
            actorUserId: 'actor-1',
            reasonCode: 'ACADEMIC_REVIEW',
            notes: null,
            relatedIncidentIds: null,
            relatedOverrideId: null,
            metadata: null,
            createdAt: new Date().toISOString(),
        });

        await closeExamAttempt({
            dbClient,
            examId: 'exam-1',
            attemptId: 'attempt-1',
            reasonCode: 'ACADEMIC_REVIEW',
            actorUserId: 'actor-1',
        });

        expect(updateBuilder.where).toHaveBeenNthCalledWith(1, 'attempt_id', '=', 'attempt-1');
        expect(updateBuilder.where).toHaveBeenNthCalledWith(2, 'exam_id', '=', 'exam-1');
    });
});

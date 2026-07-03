import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DbClient } from '@sentinel/db';
import { resetExamAttempt } from './reset-exam-attempt';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { appendExamAttemptLifecycleEvent } from './lifecycle-event.service';
import { StudentOverridesService } from '../../student-overrides/student-overrides.service';

vi.mock('../data/get-lifecycle-attempt-context', () => ({
    getLifecycleAttemptContext: vi.fn(),
}));

vi.mock('./lifecycle-event.service', () => ({
    appendExamAttemptLifecycleEvent: vi.fn(),
}));

vi.mock('../../student-overrides/student-overrides.service', () => ({
    StudentOverridesService: {
        createStudentExamAccessOverride: vi.fn(),
    },
}));

function createUpdateBuilder() {
    return {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(undefined),
    };
}

describe('resetExamAttempt', () => {
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
                lifecycleState: 'SUBMITTED',
                scoreState: 'DRAFT',
                events: [],
            },
            exam: {
                id: 'exam-1',
                institutionId: 'institution-1',
                scheduledDate: null,
                endDateTime: new Date(Date.now() + 60_000).toISOString(),
                durationMinutes: 60,
            },
            student: {
                id: 'student-1',
            },
            incidents: [],
        } as any);
        vi.mocked(appendExamAttemptLifecycleEvent)
            .mockResolvedValueOnce({
                eventId: 'event-reset',
                attemptId: 'attempt-1',
                examId: 'exam-1',
                studentId: 'student-1',
                eventType: 'RESET',
                previousState: 'SUBMITTED',
                nextState: 'SUBMITTED',
                actorUserId: 'actor-1',
                reasonCode: 'ATTEMPT_RESET',
                notes: null,
                relatedIncidentIds: null,
                relatedOverrideId: null,
                metadata: null,
                createdAt: new Date().toISOString(),
            })
            .mockResolvedValueOnce({
                eventId: 'event-superseded',
                attemptId: 'attempt-1',
                examId: 'exam-1',
                studentId: 'student-1',
                eventType: 'SUPERSEDED',
                previousState: 'SUBMITTED',
                nextState: 'SUPERSEDED',
                actorUserId: 'actor-1',
                reasonCode: 'ATTEMPT_RESET',
                notes: null,
                relatedIncidentIds: null,
                relatedOverrideId: null,
                metadata: null,
                createdAt: new Date().toISOString(),
            });
        vi.mocked(StudentOverridesService.createStudentExamAccessOverride).mockResolvedValue({
            id: 'override-1',
        } as any);

        await resetExamAttempt({
            dbClient,
            examId: 'exam-1',
            attemptId: 'attempt-1',
            actorUserId: 'actor-1',
        });

        expect(updateBuilder.where).toHaveBeenNthCalledWith(1, 'attempt_id', '=', 'attempt-1');
        expect(updateBuilder.where).toHaveBeenNthCalledWith(2, 'exam_id', '=', 'exam-1');
        expect(StudentOverridesService.createStudentExamAccessOverride).toHaveBeenCalledWith(
            expect.objectContaining({
                examId: 'exam-1',
                body: expect.objectContaining({
                    studentId: 'student-1',
                    overrideType: 'RETAKE',
                    sourceAttemptId: 'attempt-1',
                }),
            }),
        );
    });
});

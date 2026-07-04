import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { grantMakeupExamWindow } from './grant-makeup-exam-window';
import { StudentOverridesService } from '../../student-overrides/student-overrides.service';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { appendExamAttemptLifecycleEvent } from './lifecycle-event.service';

vi.mock('../../student-overrides/student-overrides.service', () => ({
    StudentOverridesService: {
        createStudentExamAccessOverride: vi.fn(),
    },
}));

vi.mock('../data/get-lifecycle-attempt-context', () => ({
    getLifecycleAttemptContext: vi.fn(),
}));

vi.mock('./lifecycle-event.service', () => ({
    appendExamAttemptLifecycleEvent: vi.fn(),
}));

describe('grantMakeupExamWindow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates a makeup override without mutating unrelated attempts', async () => {
        vi.mocked(StudentOverridesService.createStudentExamAccessOverride).mockResolvedValue({
            id: 'override-1',
        } as never);

        const result = await grantMakeupExamWindow({
            dbClient: {} as DbClient,
            examId: 'exam-1',
            studentId: 'student-1',
            availableFrom: '2026-07-04T08:00:00.000Z',
            availableUntil: '2026-07-04T10:00:00.000Z',
            notes: 'Approved makeup.',
        });

        expect(result).toEqual({
            override: {
                id: 'override-1',
            },
            latestEvent: null,
        });
        expect(getLifecycleAttemptContext).not.toHaveBeenCalled();
        expect(appendExamAttemptLifecycleEvent).not.toHaveBeenCalled();
    });

    it('appends a makeup granted event when a source attempt is supplied', async () => {
        vi.mocked(getLifecycleAttemptContext).mockResolvedValue({
            attempt: {
                lifecycleState: 'CLOSED',
            },
            student: {
                id: 'student-1',
            },
        } as never);
        vi.mocked(StudentOverridesService.createStudentExamAccessOverride).mockResolvedValue({
            id: 'override-2',
        } as never);
        vi.mocked(appendExamAttemptLifecycleEvent).mockResolvedValue({
            eventId: 'event-1',
        } as never);

        const result = await grantMakeupExamWindow({
            dbClient: {} as DbClient,
            examId: 'exam-1',
            studentId: 'student-1',
            sourceAttemptId: 'attempt-1',
            availableFrom: '2026-07-04T08:00:00.000Z',
            availableUntil: '2026-07-04T10:00:00.000Z',
            notes: 'Approved makeup.',
        });

        expect(StudentOverridesService.createStudentExamAccessOverride).toHaveBeenCalledWith({
            dbClient: expect.anything(),
            examId: 'exam-1',
            body: expect.objectContaining({
                overrideType: 'MAKEUP',
                sourceAttemptId: 'attempt-1',
            }),
            grantedBy: null,
        });
        expect(appendExamAttemptLifecycleEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                attemptId: 'attempt-1',
                eventType: 'MAKEUP_GRANTED',
                relatedOverrideId: 'override-2',
            }),
        );
        expect(result).toEqual({
            override: {
                id: 'override-2',
            },
            latestEvent: {
                eventId: 'event-1',
            },
        });
    });
});

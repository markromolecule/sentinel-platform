import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { grantRetakeExamWindow } from './grant-retake-exam-window';
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

describe('grantRetakeExamWindow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('requires a source attempt owned by the selected student', async () => {
        vi.mocked(getLifecycleAttemptContext).mockResolvedValue({
            student: {
                id: 'another-student',
            },
        } as never);

        await expect(
            grantRetakeExamWindow({
                dbClient: {} as DbClient,
                examId: 'exam-1',
                studentId: 'student-1',
                sourceAttemptId: 'attempt-1',
                availableFrom: '2026-07-04T08:00:00.000Z',
                availableUntil: '2026-07-04T10:00:00.000Z',
            }),
        ).rejects.toThrow('The selected source attempt does not belong to this student and exam.');
    });

    it('creates a retake override and links the lifecycle event to the source attempt', async () => {
        vi.mocked(getLifecycleAttemptContext).mockResolvedValue({
            attempt: {
                lifecycleState: 'SUBMITTED',
            },
            student: {
                id: 'student-1',
            },
        } as never);
        vi.mocked(StudentOverridesService.createStudentExamAccessOverride).mockResolvedValue({
            id: 'override-3',
        } as never);
        vi.mocked(appendExamAttemptLifecycleEvent).mockResolvedValue({
            eventId: 'event-2',
        } as never);

        const result = await grantRetakeExamWindow({
            dbClient: {} as DbClient,
            examId: 'exam-1',
            studentId: 'student-1',
            sourceAttemptId: 'attempt-1',
            availableFrom: '2026-07-04T08:00:00.000Z',
            availableUntil: '2026-07-04T10:00:00.000Z',
            notes: 'Approved retake.',
        });

        expect(StudentOverridesService.createStudentExamAccessOverride).toHaveBeenCalledWith({
            dbClient: expect.anything(),
            examId: 'exam-1',
            body: expect.objectContaining({
                overrideType: 'RETAKE',
                sourceAttemptId: 'attempt-1',
            }),
            grantedBy: null,
        });
        expect(appendExamAttemptLifecycleEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                attemptId: 'attempt-1',
                eventType: 'RETAKE_GRANTED',
                relatedOverrideId: 'override-3',
            }),
        );
        expect(result).toEqual({
            override: {
                id: 'override-3',
            },
            latestEvent: {
                eventId: 'event-2',
            },
        });
    });
});

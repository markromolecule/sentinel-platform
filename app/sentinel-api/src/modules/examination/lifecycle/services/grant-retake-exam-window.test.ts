import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { grantRetakeExamWindow } from './grant-retake-exam-window';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { appendExamAttemptLifecycleEvent } from './lifecycle-event.service';
import { createRemediationExam } from './create-remediation-exam';
import { assertRemediationWindowEligibility } from './remediation-window-eligibility.service';

vi.mock('../data/get-lifecycle-attempt-context', () => ({
    getLifecycleAttemptContext: vi.fn(),
}));

vi.mock('./lifecycle-event.service', () => ({
    appendExamAttemptLifecycleEvent: vi.fn(),
}));

vi.mock('./create-remediation-exam', () => ({
    createRemediationExam: vi.fn(),
}));

vi.mock('./remediation-window-eligibility.service', () => ({
    assertRemediationWindowEligibility: vi.fn(),
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

        expect(assertRemediationWindowEligibility).toHaveBeenCalledWith({
            dbClient: expect.anything(),
            remediationType: 'RETAKE',
            examId: 'exam-1',
            studentId: 'student-1',
            availableFrom: '2026-07-04T08:00:00.000Z',
            availableUntil: '2026-07-04T10:00:00.000Z',
            sourceAttemptId: 'attempt-1',
        });
    });

    it('creates a retake remediation exam and links the lifecycle event to the source attempt', async () => {
        vi.mocked(getLifecycleAttemptContext).mockResolvedValue({
            attempt: {
                lifecycleState: 'SUBMITTED',
            },
            student: {
                id: 'student-1',
            },
            exam: {
                institutionId: 'inst-1',
            },
        } as never);
        vi.mocked(createRemediationExam).mockResolvedValue({
            remediationExam: {
                exam_id: 'cloned-exam-1',
                title: 'Exam Retake',
                scheduled_date: '2026-07-04T08:00:00.000Z',
                end_date_time: '2026-07-04T10:00:00.000Z',
                status: 'PUBLISHED',
            },
            remediationSchedule: {
                remediation_id: 'remediation-1',
                source_exam_id: 'exam-1',
                remediation_exam_id: 'cloned-exam-1',
                student_id: 'student-1',
                source_attempt_id: 'attempt-1',
                remediation_type: 'RETAKE',
                scheduled_date: '2026-07-04T08:00:00.000Z',
                end_date_time: '2026-07-04T10:00:00.000Z',
                created_by: '00000000-0000-0000-0000-000000000000',
                created_at: '2026-07-04T08:00:00.000Z',
                notes: 'Approved retake.',
            },
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

        expect(createRemediationExam).toHaveBeenCalledWith({
            dbClient: expect.anything(),
            sourceExamId: 'exam-1',
            studentId: 'student-1',
            sourceAttemptId: 'attempt-1',
            remediationType: 'RETAKE',
            scheduledDate: '2026-07-04T08:00:00.000Z',
            endDate: '2026-07-04T10:00:00.000Z',
            createdBy: '00000000-0000-0000-0000-000000000000',
            notes: 'Approved retake.',
        });
        expect(appendExamAttemptLifecycleEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                attemptId: 'attempt-1',
                eventType: 'RETAKE_GRANTED',
                relatedOverrideId: null,
            }),
        );
        expect(result).toEqual({
            remediationExam: {
                examId: 'cloned-exam-1',
                title: 'Exam Retake',
                scheduledDate: '2026-07-04T08:00:00.000Z',
                endDateTime: '2026-07-04T10:00:00.000Z',
                status: 'PUBLISHED',
            },
            remediationSchedule: {
                remediationId: 'remediation-1',
                sourceExamId: 'exam-1',
                remediationExamId: 'cloned-exam-1',
                studentId: 'student-1',
                sourceAttemptId: 'attempt-1',
                remediationType: 'RETAKE',
                scheduledDate: '2026-07-04T08:00:00.000Z',
                endDateTime: '2026-07-04T10:00:00.000Z',
                createdBy: '00000000-0000-0000-0000-000000000000',
                createdAt: '2026-07-04T08:00:00.000Z',
                notes: 'Approved retake.',
            },
            override: null,
            latestEvent: {
                eventId: 'event-2',
            },
        });
        expect(assertRemediationWindowEligibility).toHaveBeenCalledWith({
            dbClient: expect.anything(),
            remediationType: 'RETAKE',
            examId: 'exam-1',
            studentId: 'student-1',
            availableFrom: '2026-07-04T08:00:00.000Z',
            availableUntil: '2026-07-04T10:00:00.000Z',
            sourceAttemptId: 'attempt-1',
        });
    });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type DbClient } from '@sentinel/db';
import { grantMakeupExamWindow } from './grant-makeup-exam-window';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { appendExamAttemptLifecycleEvent } from './lifecycle-event.service';
import { createRemediationExam } from './create-remediation-exam';

vi.mock('../data/get-lifecycle-attempt-context', () => ({
    getLifecycleAttemptContext: vi.fn(),
}));

vi.mock('./lifecycle-event.service', () => ({
    appendExamAttemptLifecycleEvent: vi.fn(),
}));

vi.mock('./create-remediation-exam', () => ({
    createRemediationExam: vi.fn(),
}));

describe('grantMakeupExamWindow', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creates a makeup remediation exam without mutating unrelated attempts', async () => {
        vi.mocked(createRemediationExam).mockResolvedValue({
            remediationExam: {
                exam_id: 'cloned-exam-2',
                title: 'Exam Makeup',
                scheduled_date: '2026-07-04T08:00:00.000Z',
                end_date_time: '2026-07-04T10:00:00.000Z',
                status: 'PUBLISHED',
            },
            remediationSchedule: {
                remediation_id: 'remediation-2',
                source_exam_id: 'exam-1',
                remediation_exam_id: 'cloned-exam-2',
                student_id: 'student-1',
                source_attempt_id: null,
                remediation_type: 'MAKEUP',
                scheduled_date: '2026-07-04T08:00:00.000Z',
                end_date_time: '2026-07-04T10:00:00.000Z',
                created_by: '00000000-0000-0000-0000-000000000000',
                created_at: '2026-07-04T08:00:00.000Z',
                notes: 'Approved makeup.',
            },
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
            remediationExam: {
                examId: 'cloned-exam-2',
                title: 'Exam Makeup',
                scheduledDate: '2026-07-04T08:00:00.000Z',
                endDateTime: '2026-07-04T10:00:00.000Z',
                status: 'PUBLISHED',
            },
            remediationSchedule: {
                remediationId: 'remediation-2',
                sourceExamId: 'exam-1',
                remediationExamId: 'cloned-exam-2',
                studentId: 'student-1',
                sourceAttemptId: null,
                remediationType: 'MAKEUP',
                scheduledDate: '2026-07-04T08:00:00.000Z',
                endDateTime: '2026-07-04T10:00:00.000Z',
                createdBy: '00000000-0000-0000-0000-000000000000',
                createdAt: '2026-07-04T08:00:00.000Z',
                notes: 'Approved makeup.',
            },
            override: null,
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
        vi.mocked(createRemediationExam).mockResolvedValue({
            remediationExam: {
                exam_id: 'cloned-exam-3',
                title: 'Exam Makeup',
                scheduled_date: '2026-07-04T08:00:00.000Z',
                end_date_time: '2026-07-04T10:00:00.000Z',
                status: 'PUBLISHED',
            },
            remediationSchedule: {
                remediation_id: 'remediation-3',
                source_exam_id: 'exam-1',
                remediation_exam_id: 'cloned-exam-3',
                student_id: 'student-1',
                source_attempt_id: 'attempt-1',
                remediation_type: 'MAKEUP',
                scheduled_date: '2026-07-04T08:00:00.000Z',
                end_date_time: '2026-07-04T10:00:00.000Z',
                created_by: '00000000-0000-0000-0000-000000000000',
                created_at: '2026-07-04T08:00:00.000Z',
                notes: 'Approved makeup.',
            },
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

        expect(createRemediationExam).toHaveBeenCalledWith({
            dbClient: expect.anything(),
            sourceExamId: 'exam-1',
            studentId: 'student-1',
            sourceAttemptId: 'attempt-1',
            remediationType: 'MAKEUP',
            scheduledDate: '2026-07-04T08:00:00.000Z',
            endDate: '2026-07-04T10:00:00.000Z',
            createdBy: '00000000-0000-0000-0000-000000000000',
            notes: 'Approved makeup.',
        });
        expect(appendExamAttemptLifecycleEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                attemptId: 'attempt-1',
                eventType: 'MAKEUP_GRANTED',
                relatedOverrideId: null,
            }),
        );
        expect(result).toEqual({
            remediationExam: {
                examId: 'cloned-exam-3',
                title: 'Exam Makeup',
                scheduledDate: '2026-07-04T08:00:00.000Z',
                endDateTime: '2026-07-04T10:00:00.000Z',
                status: 'PUBLISHED',
            },
            remediationSchedule: {
                remediationId: 'remediation-3',
                sourceExamId: 'exam-1',
                remediationExamId: 'cloned-exam-3',
                studentId: 'student-1',
                sourceAttemptId: 'attempt-1',
                remediationType: 'MAKEUP',
                scheduledDate: '2026-07-04T08:00:00.000Z',
                endDateTime: '2026-07-04T10:00:00.000Z',
                createdBy: '00000000-0000-0000-0000-000000000000',
                createdAt: '2026-07-04T08:00:00.000Z',
                notes: 'Approved makeup.',
            },
            override: null,
            latestEvent: {
                eventId: 'event-1',
            },
        });
    });
});

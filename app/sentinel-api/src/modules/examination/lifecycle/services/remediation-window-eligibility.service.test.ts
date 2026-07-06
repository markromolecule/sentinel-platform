import { beforeEach, describe, expect, it, vi } from 'vitest';
import { assertRemediationWindowEligibility } from './remediation-window-eligibility.service';
import type { DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';

// Mock the constants if we want to test different policies
vi.mock('../lifecycle.constants', () => ({
    REMEDIATION_REQUIRES_EXAM_END_PASSED: true,
    ALLOW_MAKEUP_OVER_IN_PROGRESS: false,
}));

describe('assertRemediationWindowEligibility', () => {
    let mockDb: any;
    let selectFromMock: any;

    beforeEach(() => {
        vi.clearAllMocks();

        selectFromMock = {
            select: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            executeTakeFirst: vi.fn(),
            execute: vi.fn(),
        };

        mockDb = {
            selectFrom: vi.fn().mockReturnValue(selectFromMock),
        };
    });

    it('throws 400 if availableUntil is not after availableFrom', async () => {
        await expect(
            assertRemediationWindowEligibility({
                dbClient: mockDb as unknown as DbClient,
                remediationType: 'MAKEUP',
                examId: 'exam-1',
                studentId: 'student-1',
                availableFrom: '2026-07-04T12:00:00Z',
                availableUntil: '2026-07-04T10:00:00Z',
            }),
        ).rejects.toThrow(HTTPException);
    });

    it('throws 404 if exam does not exist', async () => {
        selectFromMock.executeTakeFirst.mockResolvedValue(null);

        await expect(
            assertRemediationWindowEligibility({
                dbClient: mockDb as unknown as DbClient,
                remediationType: 'MAKEUP',
                examId: 'exam-1',
                studentId: 'student-1',
                availableFrom: '2026-07-04T10:00:00Z',
                availableUntil: '2026-07-04T12:00:00Z',
            }),
        ).rejects.toThrow(HTTPException);
    });

    it('throws 409 if REMEDIATION_REQUIRES_EXAM_END_PASSED is true and exam window has not closed', async () => {
        // Future date for end_date_time
        selectFromMock.executeTakeFirst.mockResolvedValue({
            exam_id: 'exam-1',
            end_date_time: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour in future
        });

        await expect(
            assertRemediationWindowEligibility({
                dbClient: mockDb as unknown as DbClient,
                remediationType: 'MAKEUP',
                examId: 'exam-1',
                studentId: 'student-1',
                availableFrom: '2026-07-04T10:00:00Z',
                availableUntil: '2026-07-04T12:00:00Z',
            }),
        ).rejects.toThrow(HTTPException);
    });

    it('throws 400 for RETAKE if sourceAttemptId is missing', async () => {
        selectFromMock.executeTakeFirst.mockResolvedValue({
            exam_id: 'exam-1',
            end_date_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // in past
        });

        await expect(
            assertRemediationWindowEligibility({
                dbClient: mockDb as unknown as DbClient,
                remediationType: 'RETAKE',
                examId: 'exam-1',
                studentId: 'student-1',
                availableFrom: '2026-07-04T10:00:00Z',
                availableUntil: '2026-07-04T12:00:00Z',
                sourceAttemptId: null,
            }),
        ).rejects.toThrow(HTTPException);
    });

    it('throws 404 for RETAKE if source attempt is not found for student/exam', async () => {
        selectFromMock.executeTakeFirst.mockResolvedValue({
            exam_id: 'exam-1',
            end_date_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // in past
        });
        selectFromMock.execute.mockResolvedValue([
            { attempt_id: 'attempt-other', lifecycle_state: 'SUBMITTED' }
        ]);

        await expect(
            assertRemediationWindowEligibility({
                dbClient: mockDb as unknown as DbClient,
                remediationType: 'RETAKE',
                examId: 'exam-1',
                studentId: 'student-1',
                availableFrom: '2026-07-04T10:00:00Z',
                availableUntil: '2026-07-04T12:00:00Z',
                sourceAttemptId: 'attempt-1',
            }),
        ).rejects.toThrow(HTTPException);
    });

    it('throws 409 for RETAKE if source attempt is not submitted or closed', async () => {
        selectFromMock.executeTakeFirst.mockResolvedValue({
            exam_id: 'exam-1',
            end_date_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // in past
        });
        selectFromMock.execute.mockResolvedValue([
            { attempt_id: 'attempt-1', lifecycle_state: 'IN_PROGRESS' }
        ]);

        await expect(
            assertRemediationWindowEligibility({
                dbClient: mockDb as unknown as DbClient,
                remediationType: 'RETAKE',
                examId: 'exam-1',
                studentId: 'student-1',
                availableFrom: '2026-07-04T10:00:00Z',
                availableUntil: '2026-07-04T12:00:00Z',
                sourceAttemptId: 'attempt-1',
            }),
        ).rejects.toThrow(HTTPException);
    });

    it('throws 409 for MAKEUP if student already has a non-superseded attempt', async () => {
        selectFromMock.executeTakeFirst.mockResolvedValue({
            exam_id: 'exam-1',
            end_date_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // in past
        });
        selectFromMock.execute.mockResolvedValue([
            { attempt_id: 'attempt-1', lifecycle_state: 'CLOSED' }
        ]);

        await expect(
            assertRemediationWindowEligibility({
                dbClient: mockDb as unknown as DbClient,
                remediationType: 'MAKEUP',
                examId: 'exam-1',
                studentId: 'student-1',
                availableFrom: '2026-07-04T10:00:00Z',
                availableUntil: '2026-07-04T12:00:00Z',
            }),
        ).rejects.toThrow(HTTPException);
    });

    it('succeeds for MAKEUP if no attempts exist', async () => {
        selectFromMock.executeTakeFirst.mockResolvedValue({
            exam_id: 'exam-1',
            end_date_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // in past
        });
        selectFromMock.execute.mockResolvedValue([]);

        await expect(
            assertRemediationWindowEligibility({
                dbClient: mockDb as unknown as DbClient,
                remediationType: 'MAKEUP',
                examId: 'exam-1',
                studentId: 'student-1',
                availableFrom: '2026-07-04T10:00:00Z',
                availableUntil: '2026-07-04T12:00:00Z',
            }),
        ).resolves.not.toThrow();
    });

    it('succeeds for RETAKE if source attempt is submitted', async () => {
        selectFromMock.executeTakeFirst.mockResolvedValue({
            exam_id: 'exam-1',
            end_date_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // in past
        });
        selectFromMock.execute.mockResolvedValue([
            { attempt_id: 'attempt-1', lifecycle_state: 'SUBMITTED' }
        ]);

        await expect(
            assertRemediationWindowEligibility({
                dbClient: mockDb as unknown as DbClient,
                remediationType: 'RETAKE',
                examId: 'exam-1',
                studentId: 'student-1',
                availableFrom: '2026-07-04T10:00:00Z',
                availableUntil: '2026-07-04T12:00:00Z',
                sourceAttemptId: 'attempt-1',
            }),
        ).resolves.not.toThrow();
    });
});

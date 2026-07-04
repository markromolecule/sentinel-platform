import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DbClient } from '@sentinel/db';
import { lockExamAttempt } from './lock-exam-attempt';
import { reopenExamAttempt } from './reopen-exam-attempt';
import { resetExamAttempt } from './reset-exam-attempt';
import { closeExamAttempt } from './close-exam-attempt';
import { finalizeExamAttemptScore } from './finalize-exam-attempt-score';
import { grantMakeupExamWindow } from './grant-makeup-exam-window';
import { grantRetakeExamWindow } from './grant-retake-exam-window';
import { getLifecycleAttemptContext } from '../data/get-lifecycle-attempt-context';
import { appendExamAttemptLifecycleEvent } from './lifecycle-event.service';
import { LogsService } from '../../../general/logs/logs.service';
import { LifecycleNotificationService } from './lifecycle-notification.service';
import { StudentOverridesService } from '../../student-overrides/student-overrides.service';

vi.mock('../data/get-lifecycle-attempt-context', () => ({
    getLifecycleAttemptContext: vi.fn(),
}));

vi.mock('./lifecycle-event.service', () => ({
    appendExamAttemptLifecycleEvent: vi.fn().mockResolvedValue({
        eventId: 'event-1',
        attemptId: 'attempt-1',
        examId: 'exam-1',
        studentId: 'student-1',
        eventType: 'LOCKED',
        previousState: 'IN_PROGRESS',
        nextState: 'LOCKED',
        actorUserId: 'actor-1',
        createdAt: new Date().toISOString(),
    }),
}));

vi.mock('../../../general/logs/logs.service', () => ({
    LogsService: {
        createLog: vi.fn(),
    },
}));

vi.mock('./lifecycle-notification.service', () => ({
    LIFECYCLE_SYSTEM_ACTOR_ID: '00000000-0000-0000-0000-000000000000',
    LifecycleNotificationService: {
        notifyLifecycleChange: vi.fn(),
    },
    notifyAttemptLifecycleStudent: vi.fn(),
    notifyAttemptLifecycleInstructor: vi.fn(),
}));

vi.mock('../../student-overrides/student-overrides.service', () => ({
    StudentOverridesService: {
        createStudentExamAccessOverride: vi.fn().mockResolvedValue({ id: 'override-1' }),
    },
}));

function createUpdateBuilder() {
    return {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(undefined),
    };
}

describe('Lifecycle Audit and Observability', () => {
    let dbClient: DbClient;
    const mockContext = {
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
        incidents: [
            {
                incidentId: 'incident-1',
                attemptId: 'attempt-1',
                severity: 'HIGH',
                status: 'CONFIRMED',
                timestamp: '2026-07-03T16:00:00.000Z',
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        const updateBuilder = createUpdateBuilder();
        dbClient = {
            updateTable: vi.fn().mockReturnValue(updateBuilder),
            selectFrom: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                executeTakeFirst: vi.fn().mockResolvedValue({ institution_id: 'institution-1' }),
            }),
        } as unknown as DbClient;

        vi.mocked(getLifecycleAttemptContext).mockResolvedValue(mockContext as any);
    });

    it('lockExamAttempt writes audit log and calls notifyLifecycleChange', async () => {
        await lockExamAttempt({
            dbClient,
            examId: 'exam-1',
            attemptId: 'attempt-1',
            reasonCode: 'PROCTOR_LOCK',
            notes: 'Test lock note',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
        });

        expect(LogsService.createLog).toHaveBeenCalledWith(
            dbClient,
            expect.objectContaining({
                userId: 'actor-1',
                action: 'exam.lifecycle_lock',
                resourceType: 'examination',
                resourceId: 'exam-1',
                activeInstitutionId: 'institution-1',
                details: expect.objectContaining({
                    attemptId: 'attempt-1',
                    studentId: 'student-1',
                    reasonCode: 'PROCTOR_LOCK',
                    notes: 'Test lock note',
                    previousState: 'IN_PROGRESS',
                    nextState: 'LOCKED',
                    relatedIncidentIds: ['incident-1'],
                }),
            }),
        );

        expect(appendExamAttemptLifecycleEvent).toHaveBeenCalledWith(
            expect.objectContaining({
                attemptId: 'attempt-1',
                examId: 'exam-1',
                studentId: 'student-1',
                eventType: 'LOCKED',
                previousState: 'IN_PROGRESS',
                nextState: 'LOCKED',
                actorUserId: 'actor-1',
                reasonCode: 'PROCTOR_LOCK',
                notes: 'Test lock note',
                relatedIncidentIds: ['incident-1'],
            }),
        );

        expect(LifecycleNotificationService.notifyLifecycleChange).toHaveBeenCalledWith(
            expect.objectContaining({
                examId: 'exam-1',
                studentId: 'student-1',
                eventType: 'LOCKED',
                actorUserId: 'actor-1',
                notes: 'Test lock note',
                institutionId: 'institution-1',
            }),
        );
    });

    it('reopenExamAttempt writes audit log and calls notifications', async () => {
        vi.mocked(getLifecycleAttemptContext).mockResolvedValue({
            ...mockContext,
            attempt: {
                ...mockContext.attempt,
                lifecycleState: 'LOCKED',
            },
        } as any);

        await reopenExamAttempt({
            dbClient,
            examId: 'exam-1',
            attemptId: 'attempt-1',
            reopenedUntil: new Date(),
            reasonCode: 'OVERRIDE_REOPEN',
            notes: 'Test reopen note',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
        });

        expect(LogsService.createLog).toHaveBeenCalledWith(
            dbClient,
            expect.objectContaining({
                userId: 'actor-1',
                action: 'exam.lifecycle_reopen',
                resourceType: 'examination',
                resourceId: 'exam-1',
                activeInstitutionId: 'institution-1',
            }),
        );
    });

    it('resetExamAttempt writes audit log', async () => {
        await resetExamAttempt({
            dbClient,
            examId: 'exam-1',
            attemptId: 'attempt-1',
            reasonCode: 'ATTEMPT_RESET',
            notes: 'Test reset note',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
        });

        expect(LogsService.createLog).toHaveBeenCalledWith(
            dbClient,
            expect.objectContaining({
                action: 'exam.lifecycle_reset',
                activeInstitutionId: 'institution-1',
            }),
        );
    });

    it('closeExamAttempt logs manual close correctly', async () => {
        await closeExamAttempt({
            dbClient,
            examId: 'exam-1',
            attemptId: 'attempt-1',
            reasonCode: 'MANUAL_CLOSE',
            notes: 'Test manual close',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
        });

        expect(LogsService.createLog).toHaveBeenLastCalledWith(
            dbClient,
            expect.objectContaining({
                action: 'exam.lifecycle_close',
                userId: 'actor-1',
            }),
        );

        expect(LifecycleNotificationService.notifyLifecycleChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
                eventType: 'CLOSED',
                actorUserId: 'actor-1',
            }),
        );
    });

    it('closeExamAttempt logs automatic close correctly', async () => {
        await closeExamAttempt({
            dbClient,
            examId: 'exam-1',
            attemptId: 'attempt-1',
            reasonCode: 'AUTO_HIGH_INCIDENT_THRESHOLD',
            notes: 'Test auto close',
            actorUserId: null,
            institutionId: 'institution-1',
        });

        expect(LogsService.createLog).toHaveBeenLastCalledWith(
            dbClient,
            expect.objectContaining({
                action: 'exam.lifecycle_automatic_close',
                userId: '00000000-0000-0000-0000-000000000000',
            }),
        );

        expect(LifecycleNotificationService.notifyLifecycleChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
                eventType: 'AUTOMATIC_CLOSE',
                actorUserId: null,
            }),
        );
    });

    it('finalizeExamAttemptScore writes audit log', async () => {
        vi.mocked(getLifecycleAttemptContext).mockResolvedValue({
            ...mockContext,
            attempt: {
                ...mockContext.attempt,
                lifecycleState: 'SUBMITTED',
            },
        } as any);

        await finalizeExamAttemptScore({
            dbClient,
            examId: 'exam-1',
            attemptId: 'attempt-1',
            notes: 'Test finalize note',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
        });

        expect(LogsService.createLog).toHaveBeenCalledWith(
            dbClient,
            expect.objectContaining({
                action: 'exam.lifecycle_finalize',
                userId: 'actor-1',
            }),
        );
    });

    it('grantMakeupExamWindow writes audit log', async () => {
        await grantMakeupExamWindow({
            dbClient,
            examId: 'exam-1',
            studentId: 'student-1',
            availableFrom: new Date(),
            availableUntil: new Date(),
            notes: 'Test makeup note',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
        });

        expect(LogsService.createLog).toHaveBeenCalledWith(
            dbClient,
            expect.objectContaining({
                action: 'exam.lifecycle_makeup',
            }),
        );
    });

    it('grantRetakeExamWindow writes audit log', async () => {
        await grantRetakeExamWindow({
            dbClient,
            examId: 'exam-1',
            studentId: 'student-1',
            sourceAttemptId: 'attempt-1',
            availableFrom: new Date(),
            availableUntil: new Date(),
            notes: 'Test retake note',
            actorUserId: 'actor-1',
            institutionId: 'institution-1',
        });

        expect(LogsService.createLog).toHaveBeenCalledWith(
            dbClient,
            expect.objectContaining({
                action: 'exam.lifecycle_retake',
            }),
        );
    });
});

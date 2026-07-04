import { type DbClient } from '@sentinel/db';
import type { ExamAttemptLifecycleEventType } from '@sentinel/shared';
import { LogsService } from '../../../general/logs/logs.service';
import {
    LIFECYCLE_SYSTEM_ACTOR_ID,
    type LifecycleNotificationEventType,
    LifecycleNotificationService,
} from './lifecycle-notification.service';

const LIFECYCLE_LOG_ACTIONS: Record<LifecycleNotificationEventType, string> = {
    STARTED: 'exam.lifecycle_started',
    SUBMITTED: 'exam.lifecycle_submitted',
    LOCKED: 'exam.lifecycle_lock',
    REOPENED: 'exam.lifecycle_reopen',
    RESET: 'exam.lifecycle_reset',
    CLOSED: 'exam.lifecycle_close',
    SUPERSEDED: 'exam.lifecycle_superseded',
    FINALIZED: 'exam.lifecycle_finalize',
    FINALIZATION_REVISED: 'exam.lifecycle_revise_finalization',
    MAKEUP_GRANTED: 'exam.lifecycle_makeup',
    RETAKE_GRANTED: 'exam.lifecycle_retake',
    INCIDENT_REVIEWED: 'exam.lifecycle_incident_reviewed',
    AUTOMATIC_CLOSE: 'exam.lifecycle_automatic_close',
};

export async function recordAttemptLifecycleAudit(args: {
    dbClient: DbClient;
    examId: string;
    studentId: string;
    attemptId?: string | null;
    eventType: LifecycleNotificationEventType;
    actorUserId?: string | null;
    institutionId?: string | null;
    reasonCode?: string | null;
    notes?: string | null;
    previousState?: string | null;
    nextState?: string | null;
    relatedIncidentIds?: string[] | null;
    relatedOverrideId?: string | null;
    details?: Record<string, unknown>;
    notify?: boolean;
}) {
    const activeInstitutionId = args.institutionId ?? '';

    if (activeInstitutionId) {
        try {
            await LogsService.createLog(args.dbClient, {
                userId: args.actorUserId ?? LIFECYCLE_SYSTEM_ACTOR_ID,
                action: LIFECYCLE_LOG_ACTIONS[args.eventType],
                resourceType: 'examination',
                resourceId: args.examId,
                activeInstitutionId,
                details: {
                    examId: args.examId,
                    attemptId: args.attemptId ?? null,
                    studentId: args.studentId,
                    eventType:
                        args.eventType === 'AUTOMATIC_CLOSE'
                            ? ('CLOSED' satisfies ExamAttemptLifecycleEventType)
                            : args.eventType,
                    previousState: args.previousState ?? null,
                    nextState: args.nextState ?? null,
                    reasonCode: args.reasonCode ?? null,
                    notes: args.notes ?? null,
                    relatedIncidentIds: args.relatedIncidentIds ?? null,
                    relatedOverrideId: args.relatedOverrideId ?? null,
                    ...args.details,
                },
            });
        } catch (err) {
            console.error('Failed to create lifecycle audit log:', err);
        }
    }

    if (args.notify === false) {
        return;
    }

    try {
        await LifecycleNotificationService.notifyLifecycleChange({
            dbClient: args.dbClient,
            attemptId: args.attemptId ?? null,
            examId: args.examId,
            studentId: args.studentId,
            eventType: args.eventType,
            actorUserId: args.actorUserId ?? null,
            institutionId: args.institutionId ?? null,
            notes: args.notes ?? null,
        });
    } catch (err) {
        console.error('Failed to send lifecycle notification:', err);
    }
}

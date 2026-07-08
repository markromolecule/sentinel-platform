import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import {
    type UserQueryScope,
    applyIncidentQueryScoping,
} from '../../../telemetry/storage/data/query-scoping';
import { type ReviewExamIncidentsBody } from '../incidents.dto';
import { LogsService } from '../../../general/logs/logs.service';
import { appendExamAttemptLifecycleEvent } from '../../lifecycle/services/lifecycle-event.service';
import { closeExamAttempt } from '../../lifecycle/services/close-exam-attempt';
import { lockExamAttempt } from '../../lifecycle/services/lock-exam-attempt';
import { transitionExamAttemptLifecycle } from '../../lifecycle/services/lifecycle-transition.service';

type ReviewableIncidentRow = {
    incident_id: string;
    attempt_id: string;
    student_id: string;
    lifecycle_state: 'IN_PROGRESS' | 'LOCKED' | 'CLOSED' | 'SUBMITTED' | 'SUPERSEDED';
    institution_id: string | null;
};

/**
 * Reviews (confirms or dismisses) multiple incidents, and optionally completes
 * a lifecycle follow-up action (locking or closing the exam attempt) as part
 * of confirming them.
 */
export async function reviewExamIncidentsData({
    dbClient,
    reviewerUserId,
    payload,
    examId,
    userScope,
}: {
    dbClient: DbClient;
    reviewerUserId: string;
    payload: ReviewExamIncidentsBody;
    examId: string;
    userScope?: UserQueryScope;
}): Promise<{ updatedCount: number; updatedAt: Date; attemptIds: string[] }> {
    const { incidentIds, status, reviewNotes, lifecycleAction, reasonCode, notes } = payload;
    const updatedAt = new Date();

    let allowedQuery = dbClient
        .selectFrom('flagged_incidents as fi')
        .innerJoin('exam_attempts as ea', 'ea.attempt_id', 'fi.attempt_id')
        .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .select([
            'fi.incident_id',
            'fi.attempt_id',
            'ea.student_id',
            'ea.lifecycle_state',
            'e.institution_id',
        ])
        .where('ea.exam_id', '=', examId)
        .where('fi.incident_id', 'in', incidentIds);

    if (userScope) {
        allowedQuery = applyIncidentQueryScoping(allowedQuery, userScope);
    }

    const allowedRows = (await allowedQuery.execute()) as ReviewableIncidentRow[];
    const allowedIds = allowedRows.map((r) => r.incident_id);

    if (allowedIds.length === 0) {
        throw new HTTPException(404, {
            message: 'Exam incidents not found or access denied.',
        });
    }

    const attemptIds = Array.from(new Set(allowedRows.map((row) => row.attempt_id)));

    if (lifecycleAction) {
        if (status !== 'CONFIRMED') {
            throw new HTTPException(400, {
                message:
                    'Lifecycle follow-up actions can only be applied while confirming incidents.',
            });
        }

        if (attemptIds.length !== 1) {
            throw new HTTPException(409, {
                message:
                    'Lifecycle follow-up actions require all reviewed incidents to belong to one attempt.',
            });
        }

        const attemptRow = allowedRows[0];

        transitionExamAttemptLifecycle({
            currentState: attemptRow?.lifecycle_state ?? null,
            nextState: lifecycleAction === 'LOCK_ATTEMPT' ? 'LOCKED' : 'CLOSED',
            eventType: lifecycleAction === 'LOCK_ATTEMPT' ? 'LOCKED' : 'CLOSED',
        });
    }

    const result = await dbClient
        .updateTable('flagged_incidents')
        .set({
            status,
            review_notes: reviewNotes !== undefined && reviewNotes !== '' ? reviewNotes : null,
            reviewed_by: reviewerUserId,
            reviewed_at: updatedAt,
        })
        .where('incident_id', 'in', allowedIds)
        .executeTakeFirst();

    const updatedCount = Number(result.numUpdatedRows ?? allowedIds.length);

    const groupedIncidents = allowedRows.reduce<
        Map<
            string,
            {
                attemptId: string;
                studentId: string;
                lifecycleState: ReviewableIncidentRow['lifecycle_state'];
                incidentIds: string[];
            }
        >
    >((map, row) => {
        const existing = map.get(row.attempt_id);

        if (existing) {
            existing.incidentIds.push(row.incident_id);
            return map;
        }

        map.set(row.attempt_id, {
            attemptId: row.attempt_id,
            studentId: row.student_id,
            lifecycleState: row.lifecycle_state,
            incidentIds: [row.incident_id],
        });
        return map;
    }, new Map());

    for (const groupedIncident of groupedIncidents.values()) {
        await appendExamAttemptLifecycleEvent({
            dbClient,
            attemptId: groupedIncident.attemptId,
            examId,
            studentId: groupedIncident.studentId,
            eventType: 'INCIDENT_REVIEWED',
            previousState: groupedIncident.lifecycleState,
            nextState: groupedIncident.lifecycleState,
            actorUserId: reviewerUserId,
            reasonCode: reasonCode ?? null,
            notes: notes ?? reviewNotes ?? null,
        });
    }

    if (lifecycleAction && attemptIds.length === 1) {
        const institutionId = allowedRows[0]?.institution_id ?? undefined;
        const followUpNotes = notes ?? reviewNotes ?? null;

        if (lifecycleAction === 'LOCK_ATTEMPT') {
            await lockExamAttempt({
                dbClient,
                examId,
                attemptId: attemptIds[0]!,
                reasonCode: reasonCode ?? 'CONFIRMED_INCIDENT_LOCK',
                notes: followUpNotes,
                actorUserId: reviewerUserId,
                institutionId: institutionId ?? undefined,
            });
        } else {
            await closeExamAttempt({
                dbClient,
                examId,
                attemptId: attemptIds[0]!,
                reasonCode: reasonCode ?? 'CONFIRMED_INCIDENT_CLOSE',
                notes: followUpNotes,
                actorUserId: reviewerUserId,
                institutionId: institutionId ?? undefined,
            });
        }
    }

    // Optional audit logging
    try {
        const institutionIdsByIncidentId = new Map(
            allowedRows.map((row) => [row.incident_id, row.institution_id]),
        );

        for (const incidentId of allowedIds) {
            const institutionId = institutionIdsByIncidentId.get(incidentId);

            if (institutionId) {
                await LogsService.createLog(dbClient, {
                    userId: reviewerUserId,
                    action: 'telemetry.incident_reviewed',
                    resourceType: 'telemetry_incident',
                    resourceId: incidentId,
                    activeInstitutionId: institutionId,
                    details: {
                        incidentId,
                        status,
                        reviewerUserId,
                    },
                });
            }
        }
    } catch (logErr) {
        console.error('Failed to log telemetry bulk reviews:', logErr);
    }

    return {
        updatedCount,
        updatedAt,
        attemptIds,
    };
}

import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import {
    type UserQueryScope,
    applyIncidentQueryScoping,
} from '../../telemetry/storage/data/query-scoping';
import {
    type GetExamIncidentsQuery,
    type IncidentLogItem,
    type ReviewExamIncidentsBody,
} from './incidents.dto';
import { Schema } from '@sentinel/shared';
import {
    parseIncidentDetails,
    parseStructuredValue,
} from '../../telemetry/storage/mappers/mapper.utils';
import { LogsService } from '../../general/logs/logs.service';
import { appendExamAttemptLifecycleEvent } from '../lifecycle/services/lifecycle-event.service';
import { closeExamAttempt } from '../lifecycle/services/close-exam-attempt';
import { lockExamAttempt } from '../lifecycle/services/lock-exam-attempt';
import { transitionExamAttemptLifecycle } from '../lifecycle/services/lifecycle-transition.service';

type ReviewableIncidentRow = {
    incident_id: string;
    attempt_id: string;
    student_id: string;
    lifecycle_state: 'IN_PROGRESS' | 'LOCKED' | 'CLOSED' | 'SUBMITTED' | 'SUPERSEDED';
    institution_id: string | null;
};

export class IncidentsService {
    /**
     * Retrieves paginated, filtered incidents for an exam.
     */
    static async getExamIncidentsData({
        dbClient,
        examId,
        filters,
        userScope,
    }: {
        dbClient: DbClient;
        examId: string;
        filters: GetExamIncidentsQuery;
        userScope?: UserQueryScope;
    }): Promise<{ data: IncidentLogItem[]; total: number }> {
        const { sectionId, studentId, severity, type, status, page, limit } = filters;

        // Build base select query
        let query = dbClient
            .selectFrom('flagged_incidents as fi')
            .innerJoin('exam_attempts as ea', 'ea.attempt_id', 'fi.attempt_id')
            .innerJoin('exams as e', 'e.exam_id', 'ea.exam_id')
            .innerJoin('students as st', 'st.student_id', 'ea.student_id')
            .leftJoin('user_profiles as up', 'up.user_id', 'st.user_id')
            // Join sections through enrollments to class groups
            .leftJoin('enrollments as enr', 'enr.student_id', 'st.student_id')
            .leftJoin('class_groups as cg', 'cg.class_group_id', 'enr.class_group_id')
            .leftJoin('subject_offerings as so', 'so.subject_offering_id', 'cg.subject_offering_id')
            .leftJoin('sections as sec', (join) =>
                join
                    .onRef('sec.section_id', '=', 'cg.section_id')
                    .on((eb) =>
                        eb.or([
                            eb('cg.class_group_id', '=', eb.ref('e.class_group_id')),
                            eb('cg.subject_id', '=', eb.ref('e.subject_id')),
                            eb('so.subject_id', '=', eb.ref('e.subject_id')),
                            eb('sec.section_id', '=', eb.ref('e.section_id')),
                        ]),
                    ),
            )
            .select([
                'fi.incident_id',
                'fi.attempt_id',
                'ea.exam_id',
                'e.title as exam_title',
                'e.institution_id',
                'st.user_id as student_user_id',
                'st.student_id as student_record_id',
                'st.student_number',
                sql<
                    string | null
                >`NULLIF(TRIM(CONCAT_WS(' ', up.first_name, up.last_name)), '')`.as('student_name'),
                'up.first_name',
                'up.last_name',
                'cg.section_id',
                'sec.section_name',
                'fi.platform',
                'fi.source',
                'fi.rule_key',
                'fi.incident_type',
                'fi.severity',
                'fi.status',
                'fi.timestamp',
                'fi.evidence_url',
                'fi.reviewed_by',
                'fi.reviewed_at',
                'fi.review_notes',
                'fi.configuration_snapshot',
                'fi.session_context',
                'fi.details',
                'ea.started_at as attempt_started_at',
            ])
            .where('ea.exam_id', '=', examId);

        if (userScope) {
            query = applyIncidentQueryScoping(query, userScope);
        }

        // Apply filters
        if (sectionId) {
            query = query.where('cg.section_id', '=', sectionId);
        }

        if (studentId) {
            const searchPattern = `%${studentId}%`;
            query = query.where((eb) =>
                eb.or([
                    eb('st.student_number', 'ilike', searchPattern),
                    eb('up.first_name', 'ilike', searchPattern),
                    eb('up.last_name', 'ilike', searchPattern),
                    eb(sql`CONCAT(up.first_name, ' ', up.last_name)`, 'ilike', searchPattern),
                ]),
            );
        }

        if (severity) {
            query = query.where('fi.severity', '=', severity);
        }

        if (type) {
            query = query.where('fi.incident_type', '=', type);
        }

        if (status) {
            query = query.where('fi.status', '=', status);
        }

        query = query.distinctOn('fi.incident_id');

        // To get total count, we wrap this base query or count it
        // Note: distinctOn requires ordering by the distinct column first or wrapping in subquery
        const countQuery = dbClient
            .selectFrom(query.as('sub'))
            .select(sql<number>`count(*)::int`.as('total_count'));

        const totalRow = await countQuery.executeTakeFirst();
        const total = Number(totalRow?.total_count ?? 0);

        // Pagination and Sorting
        const rows = await query
            .orderBy('fi.incident_id') // distinctOn requirement: must order by the distinct field first
            .orderBy(sql`case when sec.section_name is null then 1 else 0 end`, 'asc')
            .orderBy('fi.timestamp', 'desc')
            .limit(limit)
            .offset((page - 1) * limit)
            .execute();

        const data: IncidentLogItem[] = rows.map((row) => {
            const elapsedSeconds =
                row.timestamp && row.attempt_started_at
                    ? Math.max(
                          0,
                          Math.floor(
                              (new Date(row.timestamp).getTime() -
                                  new Date(row.attempt_started_at).getTime()) /
                                  1000,
                          ),
                      )
                    : 0;

            return {
                incidentId: row.incident_id,
                attemptId: row.attempt_id,
                examId: row.exam_id,
                examTitle: row.exam_title,
                institutionId: row.institution_id,
                studentId: row.student_user_id,
                studentRecordId: row.student_record_id,
                studentName: row.student_name,
                platform: row.platform as any,
                source: row.source as any,
                ruleKey: row.rule_key as any,
                incidentType: row.incident_type as any,
                severity: row.severity as any,
                status: row.status as any,
                timestamp: row.timestamp ? new Date(row.timestamp).toISOString() : null,
                evidenceUrl: row.evidence_url,
                reviewedBy: row.reviewed_by,
                reviewedAt: row.reviewed_at ? new Date(row.reviewed_at).toISOString() : null,
                reviewNotes: row.review_notes,
                configurationSnapshot: parseStructuredValue(
                    row.configuration_snapshot,
                    Schema.telemetryConfigurationSnapshotSchema,
                ),
                sessionContext: parseStructuredValue(
                    row.session_context,
                    Schema.telemetrySessionContextSchema,
                ),
                details: parseIncidentDetails(row.details),
                studentNo: row.student_number,
                sectionId: row.section_id,
                sectionName: row.section_name,
                elapsedSeconds,
            };
        });

        return {
            data,
            total,
        };
    }

    /**
     * Reviews multiple incidents (confirming or dismissing).
     */
    static async reviewExamIncidentsData({
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
}

import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import { type TelemetryIncidentRecord, type GetTelemetryIncidentsQuery } from '../storage.dto';
import { mapTelemetryIncidentRow } from '../mappers/query-incident.mapper';
import { type UserQueryScope, applyIncidentQueryScoping } from './query-scoping';

const DEFAULT_INCIDENT_LIMIT = 100;

/**
 * Builds the base incident query with all necessary joins and selections.
 */
export function buildIncidentQuery(db: DbClient, scopedInstitutionId?: string, userScope?: UserQueryScope) {
    let query = db
        .selectFrom('flagged_incidents as fi')
        .leftJoin('exam_attempts as ea', 'ea.attempt_id', 'fi.attempt_id')
        .leftJoin('exams as e', 'e.exam_id', 'ea.exam_id')
        .leftJoin('students as s', 's.student_id', 'ea.student_id')
        .leftJoin('user_profiles as up', 'up.user_id', 's.user_id')
        .select([
            'fi.incident_id',
            'fi.attempt_id',
            'ea.exam_id',
            'e.title as exam_title',
            'e.institution_id',
            's.user_id as student_user_id',
            's.student_id as student_record_id',
            sql<string | null>`NULLIF(TRIM(CONCAT_WS(' ', up.first_name, up.last_name)), '')`.as(
                'student_name',
            ),
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
        ]);

    if (scopedInstitutionId) {
        query = query.where('e.institution_id', '=', scopedInstitutionId);
    }

    if (userScope) {
        query = applyIncidentQueryScoping(query, userScope);
    }

    return query;
}

/**
 * Retrieves a list of proctoring incidents from the database with filtering and pagination.
 */
export async function getIncidentsFromDb(
    db: DbClient,
    filters: GetTelemetryIncidentsQuery,
    scopedInstitutionId?: string,
    userScope?: UserQueryScope,
): Promise<TelemetryIncidentRecord[]> {
    let query = buildIncidentQuery(db, scopedInstitutionId, userScope);

    if (filters.attemptId) {
        query = query.where('fi.attempt_id', '=', filters.attemptId);
    }

    if (filters.examId) {
        query = query.where('ea.exam_id', '=', filters.examId);
    }

    if (filters.studentId) {
        query = query.where('s.user_id', '=', filters.studentId);
    }

    if (filters.platform) {
        query = query.where('fi.platform', '=', filters.platform);
    }

    if (filters.source) {
        query = query.where('fi.source', '=', filters.source);
    }

    if (filters.ruleKey) {
        query = query.where('fi.rule_key', '=', filters.ruleKey);
    }

    if (filters.incidentType) {
        query = query.where('fi.incident_type', '=', filters.incidentType);
    }

    if (filters.status) {
        query = query.where('fi.status', '=', filters.status);
    }

    const rows = await query
        .orderBy('fi.timestamp desc')
        .limit(filters.limit ?? DEFAULT_INCIDENT_LIMIT)
        .execute();

    return rows.map((row) => mapTelemetryIncidentRow(row));
}

/**
 * Retrieves a single proctoring incident by its ID.
 */
export async function getIncidentByIdFromDb(
    db: DbClient,
    incidentId: string,
    scopedInstitutionId?: string,
    userScope?: UserQueryScope,
): Promise<TelemetryIncidentRecord> {
    const incident = await buildIncidentQuery(db, scopedInstitutionId, userScope)
        .where('fi.incident_id', '=', incidentId)
        .executeTakeFirst();

    if (!incident) {
        throw new HTTPException(404, {
            message: 'Telemetry incident not found.',
        });
    }

    return mapTelemetryIncidentRow(incident);
}

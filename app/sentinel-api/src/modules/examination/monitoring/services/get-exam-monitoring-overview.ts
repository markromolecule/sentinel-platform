import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import type { AssessmentAllowedRole } from '../../assessment/assessment-access';
import type { MonitoringOverview } from '../monitoring.dto';
import { getMonitoringExamContext } from './get-monitoring-exam-context';
import {
    buildMonitoringOverview,
    mapMonitoringExam,
    mapMonitoringStudentSummary,
    type MonitoringStudentRow,
} from './map-monitoring-response';

type GetExamMonitoringOverviewArgs = {
    dbClient: DbClient;
    examId: string;
    institutionId?: string;
    viewerRole: AssessmentAllowedRole;
    userId?: string | null;
};

export async function getExamMonitoringOverview({
    dbClient,
    examId,
    institutionId,
    viewerRole,
    userId,
}: GetExamMonitoringOverviewArgs): Promise<MonitoringOverview> {
    const exam = await getMonitoringExamContext({
        dbClient,
        examId,
        institutionId,
        viewerRole,
        userId,
    });

    const latestAttempts = dbClient
        .selectFrom('exam_attempts as ea')
        .distinctOn('ea.student_id')
        .select([
            'ea.attempt_id',
            'ea.student_id',
            sql<string | null>`ea.status::text`.as('attempt_status'),
            'ea.started_at',
            'ea.completed_at',
            'ea.time_spent_minutes',
            'ea.answered_question_count',
            'ea.score',
            'ea.total_score',
            'ea.created_at',
        ])
        .where('ea.exam_id', '=', examId)
        .where('ea.student_id', 'is not', null)
        .orderBy('ea.student_id')
        .orderBy('ea.created_at', 'desc')
        .as('latest_attempts');

    const incidentSummary = dbClient
        .selectFrom('flagged_incidents as fi')
        .select([
            'fi.attempt_id',
            sql<number>`count(*)::int`.as('incident_count'),
            sql<number>`count(*) filter (
                where coalesce(fi.status, 'PENDING') = 'PENDING'
            )::int`.as('open_incident_count'),
            sql<boolean>`bool_or(coalesce(fi.severity::text, 'MEDIUM') = 'HIGH')`.as(
                'has_high_severity',
            ),
            sql<Date | null>`max(fi.timestamp)`.as('latest_incident_at'),
            sql<string | null>`(
                array_agg(fi.incident_type::text order by fi.timestamp desc nulls last)
            )[1]`.as('latest_incident_type'),
        ])
        .groupBy('fi.attempt_id')
        .as('incident_summary');

    const rows = (await dbClient
        .selectFrom(latestAttempts)
        .innerJoin('students as st', 'st.student_id', 'latest_attempts.student_id')
        .leftJoin('user_profiles as up', 'up.user_id', 'st.user_id')
        .leftJoin(incidentSummary, 'incident_summary.attempt_id', 'latest_attempts.attempt_id')
        .select([
            'st.user_id as student_user_id',
            'st.student_id as student_record_id',
            'st.student_number',
            'up.first_name',
            'up.last_name',
            'up.last_seen_at',
            'latest_attempts.attempt_id',
            'latest_attempts.attempt_status',
            'latest_attempts.started_at',
            'latest_attempts.completed_at',
            'latest_attempts.time_spent_minutes',
            'latest_attempts.score',
            'latest_attempts.total_score',
            sql<number>`coalesce(incident_summary.incident_count, 0)`.as('incident_count'),
            sql<number>`coalesce(incident_summary.open_incident_count, 0)`.as(
                'open_incident_count',
            ),
            sql<boolean>`coalesce(incident_summary.has_high_severity, false)`.as(
                'has_high_severity',
            ),
            'incident_summary.latest_incident_type',
            'incident_summary.latest_incident_at',
        ])
        .orderBy('up.last_name')
        .orderBy('up.first_name')
        .execute()) as MonitoringStudentRow[];

    const students = rows.map((row) =>
        mapMonitoringStudentSummary(row, exam.durationMinutes, exam.questionCount),
    );

    return buildMonitoringOverview({
        exam: mapMonitoringExam(exam),
        students,
    });
}

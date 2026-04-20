import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { sql } from 'kysely';
import type { AssessmentAllowedRole } from '../../assessment/assessment-access';
import { TelemetryStorageService } from '../../../telemetry/storage/storage.service';
import type { MonitoringStudentDetail } from '../monitoring.dto';
import { getMonitoringExamContext } from './get-monitoring-exam-context';
import { mapMonitoringStudentDetail, type MonitoringStudentRow } from './map-monitoring-response';

type GetExamMonitoringStudentDetailArgs = {
    dbClient: DbClient;
    examId: string;
    studentId: string;
    institutionId?: string;
    viewerRole: AssessmentAllowedRole;
    userId?: string | null;
};

export async function getExamMonitoringStudentDetail({
    dbClient,
    examId,
    studentId,
    institutionId,
    viewerRole,
    userId,
}: GetExamMonitoringStudentDetailArgs): Promise<MonitoringStudentDetail> {
    const exam = await getMonitoringExamContext({
        dbClient,
        examId,
        institutionId,
        viewerRole,
        userId,
    });

    const latestAttempt = (await dbClient
        .selectFrom('exam_attempts as ea')
        .distinctOn('ea.student_id')
        .innerJoin('students as st', 'st.student_id', 'ea.student_id')
        .leftJoin('user_profiles as up', 'up.user_id', 'st.user_id')
        .select([
            'st.user_id as student_user_id',
            'st.student_id as student_record_id',
            'st.student_number',
            'up.first_name',
            'up.last_name',
            'up.last_seen_at',
            'ea.attempt_id',
            sql<string | null>`ea.status::text`.as('attempt_status'),
            'ea.started_at',
            'ea.completed_at',
            'ea.time_spent_minutes',
            'ea.score',
            'ea.total_score',
            sql<number>`coalesce((
                select count(*)::int
                from flagged_incidents as fi
                where fi.attempt_id = ea.attempt_id
            ), 0)`.as('incident_count'),
            sql<number>`coalesce((
                select count(*)::int
                from flagged_incidents as fi
                where fi.attempt_id = ea.attempt_id
                  and coalesce(fi.status, 'PENDING') = 'PENDING'
            ), 0)`.as('open_incident_count'),
            sql<boolean>`coalesce((
                select bool_or(coalesce(fi.severity::text, 'MEDIUM') = 'HIGH')
                from flagged_incidents as fi
                where fi.attempt_id = ea.attempt_id
            ), false)`.as('has_high_severity'),
            sql<string | null>`(
                select fi.incident_type::text
                from flagged_incidents as fi
                where fi.attempt_id = ea.attempt_id
                order by fi.timestamp desc nulls last
                limit 1
            )`.as('latest_incident_type'),
            sql<Date | null>`(
                select max(fi.timestamp)
                from flagged_incidents as fi
                where fi.attempt_id = ea.attempt_id
            )`.as('latest_incident_at'),
        ])
        .where('ea.exam_id', '=', examId)
        .where(sql<boolean>`(st.user_id = ${studentId} or st.student_id = ${studentId})`)
        .orderBy('ea.student_id')
        .orderBy('ea.created_at', 'desc')
        .executeTakeFirst()) as MonitoringStudentRow | undefined;

    if (!latestAttempt) {
        throw new HTTPException(404, {
            message: 'Monitoring student record not found.',
        });
    }

    const incidents = await TelemetryStorageService.getIncidents(
        dbClient,
        {
            attemptId: latestAttempt.attempt_id,
            limit: 200,
        },
        institutionId,
    );

    return mapMonitoringStudentDetail(latestAttempt, exam.durationMinutes, incidents);
}

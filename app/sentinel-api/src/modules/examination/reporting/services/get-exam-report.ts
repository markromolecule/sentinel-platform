import { type DbClient } from '@sentinel/db';
import { sql } from 'kysely';
import { paginateItems } from '../../../../lib/pagination';
import type { AssessmentAllowedRole } from '../../assessment/assessment-access';
import type { ExamReport } from '../reporting.dto';
import { getReportingExamContext } from './get-reporting-exam-context';
import {
    buildExamReport,
    mapReportExam,
    mapReportStudentSummary,
    type ReportIncidentSeverityBreakdownRow,
    type ReportIncidentTypeBreakdownRow,
    type ReportStudentRow,
} from './map-reporting-response';
import { StudentOverridesService } from '../../student-overrides/student-overrides.service';
import type { StudentExamAccessOverride } from '../../student-overrides/student-overrides.dto';

type GetExamReportArgs = {
    dbClient: DbClient;
    examId: string;
    institutionId?: string;
    viewerRole: AssessmentAllowedRole;
    userId?: string | null;
    search?: string;
    sectionId?: string;
    page: number;
    pageSize: number;
};

function parseDateValue(value?: string | Date | null) {
    if (!value) {
        return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function compareOverrideRecency(left: StudentExamAccessOverride, right: StudentExamAccessOverride) {
    const leftTime =
        parseDateValue(left.updatedAt)?.getTime() ??
        parseDateValue(left.createdAt)?.getTime() ??
        parseDateValue(left.availableUntil)?.getTime() ??
        0;
    const rightTime =
        parseDateValue(right.updatedAt)?.getTime() ??
        parseDateValue(right.createdAt)?.getTime() ??
        parseDateValue(right.availableUntil)?.getTime() ??
        0;

    return rightTime - leftTime;
}

export async function getExamReport({
    dbClient,
    examId,
    institutionId,
    viewerRole,
    userId,
    search,
    sectionId,
    page,
    pageSize,
}: GetExamReportArgs): Promise<ExamReport> {
    const exam = await getReportingExamContext({
        dbClient,
        examId,
        institutionId,
        viewerRole,
        userId,
    });

    let assignedStudents = dbClient
        .selectFrom('students as st')
        .innerJoin('enrollments as enr', 'enr.student_id', 'st.student_id')
        .innerJoin('class_groups as cg', 'cg.class_group_id', 'enr.class_group_id')
        .leftJoin('subject_offerings as so', 'so.subject_offering_id', 'cg.subject_offering_id')
        .leftJoin('sections as sec', 'sec.section_id', 'cg.section_id')
        .leftJoin('user_profiles as up', 'up.user_id', 'st.user_id')
        .distinctOn('st.student_id')
        .select([
            'st.user_id as student_user_id',
            'st.student_id as student_record_id',
            'st.student_number',
            'up.first_name',
            'up.last_name',
            'cg.section_id',
            'sec.section_name',
        ]);

    if (exam.classGroupId && exam.assignedSectionIds.length === 0) {
        assignedStudents = assignedStudents.where('enr.class_group_id', '=', exam.classGroupId);
    } else {
        assignedStudents = assignedStudents.where(
            sql<boolean>`coalesce(cg.subject_id, so.subject_id) = ${exam.subjectId}`,
        );

        if (exam.classGroupId && exam.assignedSectionIds.length > 0) {
            assignedStudents = assignedStudents.where((eb) =>
                eb.or([
                    eb('enr.class_group_id', '=', exam.classGroupId),
                    eb('cg.section_id', 'in', exam.assignedSectionIds),
                ]),
            );
        } else if (exam.sectionId) {
            assignedStudents = assignedStudents.where('cg.section_id', '=', exam.sectionId);
        } else if (exam.assignedSectionIds.length > 0) {
            assignedStudents = assignedStudents.where(
                'cg.section_id',
                'in',
                exam.assignedSectionIds,
            );
        }
    }

    const assignedStudentsSubquery = assignedStudents
        .orderBy('st.student_id')
        .orderBy('sec.section_name')
        .orderBy('up.last_name')
        .orderBy('up.first_name')
        .as('assigned_students');

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
            'ea.score',
            'ea.total_score',
            'ea.created_at',
        ])
        .where('ea.exam_id', '=', examId)
        .where('ea.student_id', 'is not', null)
        .orderBy('ea.student_id')
        .orderBy('ea.created_at', 'desc')
        .as('latest_attempts');

    const attemptCounts = dbClient
        .selectFrom('exam_attempts as ea')
        .select(['ea.student_id', sql<number>`count(*)::int`.as('attempt_count')])
        .where('ea.exam_id', '=', examId)
        .where('ea.student_id', 'is not', null)
        .groupBy('ea.student_id')
        .as('attempt_counts');

    const incidentSummary = dbClient
        .selectFrom('flagged_incidents as fi')
        .select([
            'fi.attempt_id',
            sql<number>`count(*)::int`.as('incident_count'),
            sql<number>`count(*) filter (
                where coalesce(fi.status, 'PENDING') = 'PENDING'
            )::int`.as('open_incident_count'),
            sql<number>`count(*) filter (
                where coalesce(fi.status, 'PENDING') = 'PENDING'
            )::int`.as('pending_incident_count'),
            sql<number>`count(*) filter (
                where fi.status = 'REVIEWED'
            )::int`.as('reviewed_incident_count'),
            sql<number>`count(*) filter (
                where fi.status = 'CONFIRMED'
            )::int`.as('confirmed_incident_count'),
            sql<number>`count(*) filter (
                where fi.status = 'DISMISSED'
            )::int`.as('dismissed_incident_count'),
            sql<string | null>`(
                array_agg(
                    fi.incident_type::text
                    order by
                        case coalesce(fi.severity::text, 'MEDIUM')
                            when 'HIGH' then 3
                            when 'MEDIUM' then 2
                            else 1
                        end desc,
                        fi.timestamp desc nulls last
                )
            )[1]`.as('highest_incident_type'),
            sql<string | null>`(
                array_agg(
                    coalesce(fi.severity::text, 'MEDIUM')
                    order by
                        case coalesce(fi.severity::text, 'MEDIUM')
                            when 'HIGH' then 3
                            when 'MEDIUM' then 2
                            else 1
                        end desc,
                        fi.timestamp desc nulls last
                )
            )[1]`.as('highest_incident_severity'),
        ])
        .groupBy('fi.attempt_id')
        .as('incident_summary');

    const [studentRows, incidentTypeBreakdown, incidentSeverityBreakdown, accessOverrides] =
        await Promise.all([
            dbClient
                .selectFrom(assignedStudentsSubquery)
                .leftJoin(
                    latestAttempts,
                    'latest_attempts.student_id',
                    'assigned_students.student_record_id',
                )
                .leftJoin(
                    attemptCounts,
                    'attempt_counts.student_id',
                    'assigned_students.student_record_id',
                )
                .leftJoin(
                    incidentSummary,
                    'incident_summary.attempt_id',
                    'latest_attempts.attempt_id',
                )
                .select([
                    'assigned_students.student_user_id',
                    'assigned_students.student_record_id',
                    'assigned_students.student_number',
                    'assigned_students.first_name',
                    'assigned_students.last_name',
                    'assigned_students.section_id',
                    'assigned_students.section_name',
                    'latest_attempts.attempt_id',
                    'latest_attempts.attempt_status',
                    'latest_attempts.started_at',
                    'latest_attempts.completed_at',
                    'latest_attempts.time_spent_minutes',
                    'latest_attempts.score',
                    'latest_attempts.total_score',
                    sql<number>`coalesce(attempt_counts.attempt_count, 0)`.as('attempt_count'),
                    sql<number>`coalesce(incident_summary.incident_count, 0)`.as('incident_count'),
                    sql<number>`coalesce(incident_summary.open_incident_count, 0)`.as(
                        'open_incident_count',
                    ),
                    sql<number>`coalesce(incident_summary.pending_incident_count, 0)`.as(
                        'pending_incident_count',
                    ),
                    sql<number>`coalesce(incident_summary.reviewed_incident_count, 0)`.as(
                        'reviewed_incident_count',
                    ),
                    sql<number>`coalesce(incident_summary.confirmed_incident_count, 0)`.as(
                        'confirmed_incident_count',
                    ),
                    sql<number>`coalesce(incident_summary.dismissed_incident_count, 0)`.as(
                        'dismissed_incident_count',
                    ),
                    'incident_summary.highest_incident_type',
                    'incident_summary.highest_incident_severity',
                ])
                .orderBy('assigned_students.last_name')
                .orderBy('assigned_students.first_name')
                .execute() as Promise<ReportStudentRow[]>,
            dbClient
                .selectFrom('flagged_incidents as fi')
                .innerJoin('exam_attempts as ea', 'ea.attempt_id', 'fi.attempt_id')
                .select([
                    sql<string>`fi.incident_type::text`.as('type'),
                    sql<number>`count(*)::int`.as('count'),
                ])
                .where('ea.exam_id', '=', examId)
                .groupBy('fi.incident_type')
                .orderBy(sql`count(*)`, 'desc')
                .execute() as Promise<ReportIncidentTypeBreakdownRow[]>,
            dbClient
                .selectFrom('flagged_incidents as fi')
                .innerJoin('exam_attempts as ea', 'ea.attempt_id', 'fi.attempt_id')
                .select([
                    sql<string>`coalesce(fi.severity::text, 'MEDIUM')`.as('severity'),
                    sql<number>`count(*)::int`.as('count'),
                ])
                .where('ea.exam_id', '=', examId)
                .groupBy(sql`coalesce(fi.severity::text, 'MEDIUM')`)
                .orderBy(sql`count(*)`, 'desc')
                .execute() as Promise<ReportIncidentSeverityBreakdownRow[]>,
            StudentOverridesService.listExamOverrides(dbClient, examId),
        ]);

    const overrideAttemptKindMap = new Map<string, 'makeup' | 'retake'>();
    const activeOverrideMap = new Map<string, StudentExamAccessOverride['overrideType']>();
    const now = new Date();

    for (const accessOverride of accessOverrides.sort(compareOverrideRecency)) {
        for (const usedAttemptId of accessOverride.usedAttemptIds) {
            if (accessOverride.overrideType === 'MAKEUP') {
                overrideAttemptKindMap.set(usedAttemptId, 'makeup');
            }

            if (accessOverride.overrideType === 'RETAKE') {
                overrideAttemptKindMap.set(usedAttemptId, 'retake');
            }
        }

        const availableUntil = parseDateValue(accessOverride.availableUntil);

        if (
            availableUntil &&
            availableUntil.getTime() >= now.getTime() &&
            accessOverride.usedAttempts < accessOverride.allowedAttempts &&
            !activeOverrideMap.has(accessOverride.studentId)
        ) {
            activeOverrideMap.set(accessOverride.studentId, accessOverride.overrideType);
        }
    }

    const enrichedStudentRows = studentRows.map((row) => ({
        ...row,
        attempt_kind: row.attempt_id ? (overrideAttemptKindMap.get(row.attempt_id) ?? null) : null,
        active_override_type: activeOverrideMap.get(row.student_record_id) ?? null,
    }));

    const baseReport = buildExamReport({
        exam: mapReportExam(exam),
        students: enrichedStudentRows.map((row) => mapReportStudentSummary(row, exam.passingScore)),
        incidentBreakdownByType: incidentTypeBreakdown,
        incidentBreakdownBySeverity: incidentSeverityBreakdown,
    });

    const normalizedSearch = search?.trim().toLowerCase() ?? '';
    const filteredStudents = baseReport.students.filter((student) => {
        if (sectionId && student.sectionId !== sectionId) {
            return false;
        }

        if (!normalizedSearch) {
            return true;
        }

        return [student.firstName, student.lastName, student.studentNo, student.sectionName]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch);
    });

    const paginatedStudents = paginateItems(filteredStudents, page, pageSize);
    const sections = Array.from(
        new Map(
            baseReport.students
                .map((student) =>
                    student.sectionId && student.sectionName
                        ? ([student.sectionId, student.sectionName] as const)
                        : null,
                )
                .filter((entry): entry is readonly [string, string] => Boolean(entry)),
        ).entries(),
    )
        .sort((left, right) => left[1].localeCompare(right[1]))
        .map(([id, name]) => ({ id, name }));

    return {
        ...baseReport,
        sections,
        students: paginatedStudents.items,
        studentsPagination: paginatedStudents.pagination,
    };
}

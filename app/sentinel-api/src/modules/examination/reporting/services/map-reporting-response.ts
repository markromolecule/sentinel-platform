import type {
    ExamReport,
    ExamReportActionItem,
    ExamReportExam,
    ExamReportStudentSummary,
} from '../reporting.dto';
import type { ReportingExamContext } from './get-reporting-exam-context';
import type { TelemetryIncidentType } from '@sentinel/shared';

export type ReportStudentRow = {
    student_user_id: string | null;
    student_record_id: string;
    student_number: string;
    first_name: string | null;
    last_name: string | null;
    section_id?: string | null;
    section_name?: string | null;
    attempt_id: string | null;
    attempt_status: string | null;
    started_at: Date | string | null;
    completed_at: Date | string | null;
    time_spent_minutes: number | null;
    score: number | null;
    total_score: number | null;
    attempt_count: number | string | null;
    incident_count: number | string | null;
    open_incident_count: number | string | null;
    pending_incident_count: number | string | null;
    reviewed_incident_count: number | string | null;
    confirmed_incident_count: number | string | null;
    dismissed_incident_count: number | string | null;
    highest_incident_type: TelemetryIncidentType | null;
    highest_incident_severity: string | null;
    attempt_kind?: 'primary' | 'makeup' | 'retake' | null;
    active_override_type?: 'MAKEUP' | 'RETAKE' | 'REOPEN' | null;
};

export type ReportIncidentTypeBreakdownRow = {
    type: TelemetryIncidentType;
    count: number | string;
};

export type ReportIncidentSeverityBreakdownRow = {
    severity: string;
    count: number | string;
};

function toIsoDate(value: Date | string | null | undefined) {
    if (!value) {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toNumber(value: number | string | null | undefined) {
    return Number(value ?? 0);
}

function roundPercentage(value: number) {
    return Math.round(value * 10) / 10;
}

function resolveStudentNames(row: ReportStudentRow) {
    return {
        firstName: row.first_name?.trim() || 'Unknown',
        lastName: row.last_name?.trim() || 'Student',
    };
}

function normalizeIncidentSeverity(
    severity: string | null | undefined,
): ExamReportStudentSummary['highestIncidentSeverity'] {
    switch (severity?.toUpperCase()) {
        case 'HIGH':
            return 'high';
        case 'LOW':
            return 'low';
        case 'MEDIUM':
            return 'medium';
        default:
            return null;
    }
}

function isSubmitted(row: ReportStudentRow) {
    return Boolean(row.completed_at) || row.attempt_status?.toUpperCase() === 'COMPLETED';
}

function getPercentage(row: ReportStudentRow) {
    const score = row.score ?? null;
    const totalScore = row.total_score ?? null;

    if (score === null || totalScore === null || totalScore <= 0) {
        return null;
    }

    return roundPercentage((score / totalScore) * 100);
}

function needsReview(row: ReportStudentRow) {
    return (
        toNumber(row.open_incident_count) > 0 ||
        normalizeIncidentSeverity(row.highest_incident_severity) === 'high'
    );
}

function needsRetake(row: ReportStudentRow, passingScore: number) {
    const percentage = getPercentage(row);

    if (!isSubmitted(row) || percentage === null) {
        return false;
    }

    if (row.active_override_type === 'RETAKE') {
        return false;
    }

    return percentage < passingScore;
}

function resolveStudentStatus(
    row: ReportStudentRow,
    passingScore: number,
): ExamReportStudentSummary['status'] {
    if (!row.attempt_id) {
        return 'absent';
    }

    if (needsReview(row)) {
        return 'flagged';
    }

    if (isSubmitted(row) || needsRetake(row, passingScore)) {
        return 'submitted';
    }

    return 'in_progress';
}

function resolveSubmissionType(row: ReportStudentRow): ExamReportStudentSummary['submissionType'] {
    if (!row.attempt_id) {
        return 'absent';
    }

    if (resolveAttemptKind(row) === 'retake' && isSubmitted(row)) {
        return 'retake';
    }

    if (isSubmitted(row)) {
        return 'manual_submit';
    }

    return null;
}

function resolveAttemptKind(row: ReportStudentRow): ExamReportStudentSummary['attemptKind'] {
    if (!row.attempt_id) {
        return null;
    }

    if (row.attempt_kind) {
        return row.attempt_kind;
    }

    if (toNumber(row.attempt_count) > 1 && isSubmitted(row)) {
        return 'retake';
    }

    return 'primary';
}

function buildActionItem(row: ReportStudentRow, reason: string): ExamReportActionItem {
    const { firstName, lastName } = resolveStudentNames(row);

    return {
        id: row.student_user_id ?? row.student_record_id,
        studentId: row.student_record_id,
        attemptId: row.attempt_id ?? null,
        studentNo: row.student_number,
        firstName,
        lastName,
        reason,
    };
}

export function mapReportExam(exam: ReportingExamContext): ExamReportExam {
    return {
        id: exam.examId,
        title: exam.title,
        subject: exam.subject,
        scheduledDate: exam.scheduledDate,
        endDateTime: exam.endDateTime,
        durationMinutes: exam.durationMinutes,
        passingScore: exam.passingScore,
    };
}

export function mapReportStudentSummary(
    row: ReportStudentRow,
    passingScore: number,
): ExamReportStudentSummary {
    const percentage = getPercentage(row);
    const openIncidentCount = toNumber(row.open_incident_count);
    const incidentCount = toNumber(row.incident_count);
    const highestIncidentSeverity = normalizeIncidentSeverity(row.highest_incident_severity);
    const reviewRequired = needsReview(row);
    const makeupRequired = !row.attempt_id;
    const retakeRequired = needsRetake(row, passingScore);
    const { firstName, lastName } = resolveStudentNames(row);

    return {
        id: row.student_user_id ?? row.student_record_id,
        studentId: row.student_record_id,
        attemptId: row.attempt_id ?? null,
        studentNo: row.student_number,
        firstName,
        lastName,
        sectionId: row.section_id ?? null,
        sectionName: row.section_name ?? null,
        status: resolveStudentStatus(row, passingScore),
        startedAt: toIsoDate(row.started_at),
        completedAt: toIsoDate(row.completed_at),
        score: row.score ?? null,
        totalScore: row.total_score ?? null,
        percentage,
        timeSpentMinutes: row.time_spent_minutes ?? null,
        incidentCount,
        openIncidentCount,
        primaryIncidentType: row.highest_incident_type ?? null,
        highestIncidentSeverity,
        incidentOutcomes: {
            pending: toNumber(row.pending_incident_count),
            reviewed: toNumber(row.reviewed_incident_count),
            confirmed: toNumber(row.confirmed_incident_count),
            dismissed: toNumber(row.dismissed_incident_count),
        },
        submissionType: resolveSubmissionType(row),
        attemptKind: resolveAttemptKind(row),
        attemptCount: toNumber(row.attempt_count),
        isFlagged: reviewRequired,
        needsReview: reviewRequired,
        needsMakeup: makeupRequired && row.active_override_type !== 'MAKEUP',
        needsRetake: retakeRequired,
    };
}

function buildAverageScore(students: ExamReportStudentSummary[]) {
    const percentages = students
        .map((student) => student.percentage)
        .filter((value): value is number => typeof value === 'number');

    if (percentages.length === 0) {
        return null;
    }

    return roundPercentage(percentages.reduce((sum, value) => sum + value, 0) / percentages.length);
}

function buildPassRate(students: ExamReportStudentSummary[], passingScore: number) {
    const submittedStudents = students.filter(
        (student) =>
            student.submissionType === 'manual_submit' ||
            student.submissionType === 'auto_submit' ||
            student.submissionType === 'force_close' ||
            student.submissionType === 'retake',
    );

    if (submittedStudents.length === 0) {
        return null;
    }

    const passedStudents = submittedStudents.filter(
        (student) => typeof student.percentage === 'number' && student.percentage >= passingScore,
    );

    return roundPercentage((passedStudents.length / submittedStudents.length) * 100);
}

function sortStudents(students: ExamReportStudentSummary[]) {
    return [...students].sort((left, right) => {
        const priorityDelta =
            Number(right.needsReview) - Number(left.needsReview) ||
            Number(right.needsMakeup) - Number(left.needsMakeup) ||
            Number(right.needsRetake) - Number(left.needsRetake);

        if (priorityDelta !== 0) {
            return priorityDelta;
        }

        const lastNameCompare = left.lastName.localeCompare(right.lastName);

        if (lastNameCompare !== 0) {
            return lastNameCompare;
        }

        return left.firstName.localeCompare(right.firstName);
    });
}

export function buildExamReport(args: {
    exam: ExamReportExam;
    students: ExamReportStudentSummary[];
    incidentBreakdownByType: ReportIncidentTypeBreakdownRow[];
    incidentBreakdownBySeverity: ReportIncidentSeverityBreakdownRow[];
}): ExamReport {
    const students = sortStudents(args.students);
    const reviewItems = students
        .filter((student) => student.needsReview)
        .map((student) =>
            buildActionItem(
                {
                    student_user_id: student.id,
                    student_record_id: student.studentId,
                    student_number: student.studentNo,
                    first_name: student.firstName,
                    last_name: student.lastName,
                    attempt_id: student.attemptId,
                    attempt_status: student.status,
                    started_at: student.startedAt,
                    completed_at: student.completedAt,
                    time_spent_minutes: student.timeSpentMinutes,
                    score: student.score,
                    total_score: student.totalScore,
                    attempt_count: student.attemptCount,
                    incident_count: student.incidentCount,
                    open_incident_count: student.openIncidentCount,
                    pending_incident_count: student.incidentOutcomes.pending,
                    reviewed_incident_count: student.incidentOutcomes.reviewed,
                    confirmed_incident_count: student.incidentOutcomes.confirmed,
                    dismissed_incident_count: student.incidentOutcomes.dismissed,
                    highest_incident_type: student.primaryIncidentType,
                    highest_incident_severity:
                        student.highestIncidentSeverity?.toUpperCase() ?? null,
                },
                student.openIncidentCount > 0
                    ? `${student.openIncidentCount} unresolved incident(s)`
                    : 'High-severity incident requires review',
            ),
        );
    const makeupItems = students
        .filter((student) => student.needsMakeup)
        .map((student) =>
            buildActionItem(
                {
                    student_user_id: student.id,
                    student_record_id: student.studentId,
                    student_number: student.studentNo,
                    first_name: student.firstName,
                    last_name: student.lastName,
                    attempt_id: student.attemptId,
                    attempt_status: student.status,
                    started_at: student.startedAt,
                    completed_at: student.completedAt,
                    time_spent_minutes: student.timeSpentMinutes,
                    score: student.score,
                    total_score: student.totalScore,
                    attempt_count: student.attemptCount,
                    incident_count: student.incidentCount,
                    open_incident_count: student.openIncidentCount,
                    pending_incident_count: student.incidentOutcomes.pending,
                    reviewed_incident_count: student.incidentOutcomes.reviewed,
                    confirmed_incident_count: student.incidentOutcomes.confirmed,
                    dismissed_incident_count: student.incidentOutcomes.dismissed,
                    highest_incident_type: student.primaryIncidentType,
                    highest_incident_severity:
                        student.highestIncidentSeverity?.toUpperCase() ?? null,
                },
                'Absent for the scheduled exam window',
            ),
        );
    const retakeItems = students
        .filter((student) => student.needsRetake)
        .map((student) =>
            buildActionItem(
                {
                    student_user_id: student.id,
                    student_record_id: student.studentId,
                    student_number: student.studentNo,
                    first_name: student.firstName,
                    last_name: student.lastName,
                    attempt_id: student.attemptId,
                    attempt_status: student.status,
                    started_at: student.startedAt,
                    completed_at: student.completedAt,
                    time_spent_minutes: student.timeSpentMinutes,
                    score: student.score,
                    total_score: student.totalScore,
                    attempt_count: student.attemptCount,
                    incident_count: student.incidentCount,
                    open_incident_count: student.openIncidentCount,
                    pending_incident_count: student.incidentOutcomes.pending,
                    reviewed_incident_count: student.incidentOutcomes.reviewed,
                    confirmed_incident_count: student.incidentOutcomes.confirmed,
                    dismissed_incident_count: student.incidentOutcomes.dismissed,
                    highest_incident_type: student.primaryIncidentType,
                    highest_incident_severity:
                        student.highestIncidentSeverity?.toUpperCase() ?? null,
                },
                `Score is below the passing score of ${args.exam.passingScore}%`,
            ),
        );

    return {
        exam: args.exam,
        summary: {
            totalAssignedStudents: students.length,
            totalStarted: students.filter((student) => student.attemptCount > 0).length,
            totalSubmitted: students.filter(
                (student) =>
                    student.submissionType === 'manual_submit' ||
                    student.submissionType === 'auto_submit' ||
                    student.submissionType === 'force_close' ||
                    student.submissionType === 'retake',
            ).length,
            totalAbsent: students.filter((student) => student.status === 'absent').length,
            flaggedStudentsCount: students.filter((student) => student.isFlagged).length,
            averageScore: buildAverageScore(students),
            passRate: buildPassRate(students, args.exam.passingScore),
            incidentBreakdownByType: args.incidentBreakdownByType.map((row) => ({
                type: row.type,
                count: toNumber(row.count),
            })),
            incidentBreakdownBySeverity: args.incidentBreakdownBySeverity.map((row) => ({
                severity: normalizeIncidentSeverity(row.severity) ?? 'medium',
                count: toNumber(row.count),
            })),
            needsReviewCount: reviewItems.length,
            needsMakeupCount: makeupItems.length,
            needsRetakeCount: retakeItems.length,
        },
        students,
        actionItems: {
            review: reviewItems,
            makeup: makeupItems,
            retake: retakeItems,
        },
    };
}

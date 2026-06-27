import type { ExamReportActionItems, ExamReportStudentSummary } from '../reporting.dto';
import {
    isSubmittedSubmissionType,
    normalizeIncidentSeverity,
    roundPercentage,
    toNumber,
} from '../services/reporting-response.shared';
import type {
    ExamReportCore,
    ReportIncidentSeverityBreakdownRow,
    ReportIncidentTypeBreakdownRow,
} from '../services/reporting-response.types';
import { buildActionItem, buildActionItemSource } from '../helpers/student-reporting.helpers';

export function sortStudents(students: ExamReportStudentSummary[]) {
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

export function buildAverageScore(students: ExamReportStudentSummary[]) {
    const percentages = students
        .map((student) => student.percentage)
        .filter((value): value is number => typeof value === 'number');

    if (percentages.length === 0) {
        return null;
    }

    return roundPercentage(percentages.reduce((sum, value) => sum + value, 0) / percentages.length);
}

export function buildPassRate(students: ExamReportStudentSummary[], passingScore: number) {
    const submittedStudents = students.filter((student) => isSubmittedSubmissionType(student.submissionType));

    if (submittedStudents.length === 0) {
        return null;
    }

    const passedStudents = submittedStudents.filter(
        (student) => typeof student.percentage === 'number' && student.percentage >= passingScore,
    );

    return roundPercentage((passedStudents.length / submittedStudents.length) * 100);
}

export function buildActionItems(
    students: ExamReportStudentSummary[],
    predicate: (student: ExamReportStudentSummary) => boolean,
    reasonFor: (student: ExamReportStudentSummary) => string,
) {
    return students
        .filter(predicate)
        .map((student) => buildActionItem(buildActionItemSource(student), reasonFor(student)));
}

export function buildReportSummary(args: {
    students: ExamReportStudentSummary[];
    passingScore: number;
    incidentBreakdownByType: ReportIncidentTypeBreakdownRow[];
    incidentBreakdownBySeverity: ReportIncidentSeverityBreakdownRow[];
    actionItems: ExamReportActionItems;
}): ExamReportCore['summary'] {
    const { students, passingScore, incidentBreakdownByType, incidentBreakdownBySeverity, actionItems } =
        args;

    return {
        totalAssignedStudents: students.length,
        totalStarted: students.filter((student) => student.attemptCount > 0).length,
        totalSubmitted: students.filter((student) => isSubmittedSubmissionType(student.submissionType)).length,
        totalAbsent: students.filter((student) => student.status === 'absent').length,
        flaggedStudentsCount: students.filter((student) => student.isFlagged).length,
        averageScore: buildAverageScore(students),
        passRate: buildPassRate(students, passingScore),
        incidentBreakdownByType: incidentBreakdownByType.map((row) => ({
            type: row.type,
            count: toNumber(row.count),
        })),
        incidentBreakdownBySeverity: incidentBreakdownBySeverity.map((row) => ({
            severity: normalizeIncidentSeverity(row.severity) ?? 'medium',
            count: toNumber(row.count),
        })),
        needsReviewCount: actionItems.review.length,
        needsMakeupCount: actionItems.makeup.length,
        needsRetakeCount: actionItems.retake.length,
    };
}

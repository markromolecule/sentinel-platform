import type { ExamReportExam, ExamReportStudentSummary } from '../reporting.dto';
import type { ReportingExamContext } from './get-reporting-exam-context';
import {
    type ExamReportCore,
    type ReportIncidentSeverityBreakdownRow,
    type ReportIncidentTypeBreakdownRow,
    type ReportStudentRow,
} from './reporting-response.types';
import { mapStudentSummary } from '../helpers/student-reporting.helpers';
import { buildActionItems, buildReportSummary, sortStudents } from '../helpers/summary-reporting.helpers';

export type { ReportIncidentSeverityBreakdownRow, ReportIncidentTypeBreakdownRow, ReportStudentRow };

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
    return mapStudentSummary(row, passingScore);
}

export function buildExamReport(args: {
    exam: ExamReportExam;
    students: ExamReportStudentSummary[];
    incidentBreakdownByType: ReportIncidentTypeBreakdownRow[];
    incidentBreakdownBySeverity: ReportIncidentSeverityBreakdownRow[];
}): ExamReportCore {
    const students = sortStudents(args.students);
    const actionItems = {
        review: buildActionItems(
            students,
            (student) => student.needsReview,
            (student) =>
                student.openIncidentCount > 0
                    ? `${student.openIncidentCount} unresolved incident(s)`
                    : 'High-severity incident requires review',
        ),
        makeup: buildActionItems(
            students,
            (student) => student.needsMakeup,
            () => 'Absent for the scheduled exam window',
        ),
        retake: buildActionItems(
            students,
            (student) => student.needsRetake,
            () => `Score is below the passing score of ${args.exam.passingScore}%`,
        ),
    };

    return {
        exam: args.exam,
        summary: buildReportSummary({
            students,
            passingScore: args.exam.passingScore,
            incidentBreakdownByType: args.incidentBreakdownByType,
            incidentBreakdownBySeverity: args.incidentBreakdownBySeverity,
            actionItems,
        }),
        students,
        actionItems,
    };
}

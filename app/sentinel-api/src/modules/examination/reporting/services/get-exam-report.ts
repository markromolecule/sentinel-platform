import { type DbClient } from '@sentinel/db';
import type { AssessmentAllowedRole } from '../../assessment/assessment-access';
import type { ExamReport } from '../reporting.dto';
import { getReportingExamContext } from './get-reporting-exam-context';
import { buildExamReport, mapReportExam, mapReportStudentSummary } from './map-reporting-response';
import { buildOverrideRecencyMaps, loadExamReportSourceData } from './exam-report-queries';
import {
    buildSections,
    enrichStudentRows,
    filterReportStudents,
    getStudentsPage,
} from './get-exam-report.view.helpers';

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

    const { studentRows, incidentTypeBreakdown, incidentSeverityBreakdown, accessOverrides } =
        await loadExamReportSourceData({
            dbClient,
            examId,
            exam,
        });

    const { overrideAttemptKindMap, activeOverrideMap } = buildOverrideRecencyMaps(accessOverrides);
    const enrichedStudentRows = enrichStudentRows({
        studentRows,
        overrideAttemptKindMap,
        activeOverrideMap,
    });
    const students = enrichedStudentRows.map((row) => mapReportStudentSummary(row, exam.passingScore));
    const baseReport = buildExamReport({
        exam: mapReportExam(exam),
        students,
        incidentBreakdownByType: incidentTypeBreakdown,
        incidentBreakdownBySeverity: incidentSeverityBreakdown,
    });

    const filteredStudents = filterReportStudents(baseReport.students, search, sectionId);
    const paginatedStudents = getStudentsPage(filteredStudents, page, pageSize);
    const sections = buildSections(baseReport.students);

    return {
        ...baseReport,
        sections,
        students: paginatedStudents.items,
        studentsPagination: paginatedStudents.pagination,
    };
}

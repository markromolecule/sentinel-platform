import type { ExamReportStudentSummary } from '../reporting.dto';
import type { EnrichedReportStudentRow } from './exam-report-queries';
import type { ReportStudentRow } from './reporting-response.types';
import type { StudentExamAccessOverride } from '../../student-overrides/student-overrides.dto';

export function buildStudentsPagination(total: number, page: number, pageSize: number) {
    const totalPages = Math.ceil(total / pageSize);
    const visibleCount = Math.min(pageSize, Math.max(total - (page - 1) * pageSize, 0));

    return {
        page,
        pageSize,
        total,
        totalPages,
        hasMore: (page - 1) * pageSize + visibleCount < total,
    };
}

export function enrichStudentRows(args: {
    studentRows: ReportStudentRow[];
    overrideAttemptKindMap: Map<string, 'makeup' | 'retake'>;
    activeOverrideMap: Map<string, StudentExamAccessOverride['overrideType']>;
}): EnrichedReportStudentRow[] {
    return args.studentRows.map((row) => ({
        ...row,
        attempt_kind: row.attempt_id
            ? (args.overrideAttemptKindMap.get(row.attempt_id) ?? null)
            : null,
        active_override_type: args.activeOverrideMap.get(row.student_record_id) ?? null,
    })) as EnrichedReportStudentRow[];
}

export function buildSections(students: ExamReportStudentSummary[]) {
    return Array.from(
        new Map(
            students
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
}

export function filterReportStudents(
    students: ExamReportStudentSummary[],
    search?: string,
    sectionId?: string,
) {
    const normalizedSearch = search?.trim().toLowerCase() ?? '';

    return students.filter((student) => {
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
}

export function getStudentsPage(
    students: ExamReportStudentSummary[],
    page: number,
    pageSize: number,
) {
    const total = students.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
        items: students.slice(start, end),
        pagination: buildStudentsPagination(total, page, pageSize),
    };
}

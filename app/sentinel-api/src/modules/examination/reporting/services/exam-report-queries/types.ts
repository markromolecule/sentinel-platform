import type { StudentExamAccessOverride } from '../../../student-overrides/student-overrides.dto';
import type { ReportStudentRow } from '../reporting-response.types';

/**
 * Contextual information for an exam being reported on, including
 * subject IDs and relevant section/class group assignments.
 */
export type ExamContextForReporting = {
    subjectId: string;
    classGroupId?: string | null;
    sectionId?: string | null;
    assignedSectionIds: string[];
};

/**
 * Enriched student row data from the database, augmented with
 * derived fields like attempt kind and active override types.
 */
export type EnrichedReportStudentRow = ReportStudentRow & {
    attempt_kind: 'primary' | 'makeup' | 'retake' | null;
    active_override_type: StudentExamAccessOverride['overrideType'] | null;
};

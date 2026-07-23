import type { ActionQueueType, ExamReportSection } from '../_types';

/**
 * Default number of students displayed per page.
 */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Default selected tab/section for the exam report page.
 */
export const DEFAULT_ACTIVE_SECTION: ExamReportSection = 'overview';

/**
 * Query search parameter key used to determine the active section/tab.
 */
export const SECTION_PARAM_KEY = 'section';

/**
 * Default selected category in the action queue.
 */
export const DEFAULT_ACTIVE_QUEUE: ActionQueueType = 'review';

/**
 * Resolves a raw section parameter or route pathname into a valid ExamReportSection.
 * Maps missing or invalid section parameters to 'overview',
 * and maps detailed attempt routes (e.g. /exams/reports/:examId/:attemptId) to 'attempts'.
 *
 * @param sectionParam - The raw query parameter value for section.
 * @param pathname - Optional pathname string to detect nested sub-routes like detailed attempt view.
 * @returns The resolved canonical ExamReportSection.
 */
export function resolveExamReportSection(
    sectionParam?: string | null,
    pathname?: string | null,
): ExamReportSection {
    if (pathname) {
        const parts = pathname.split('/').filter(Boolean);
        if (parts[0] === 'exams' && parts[1] === 'reports' && parts[2] && parts[3]) {
            return 'attempts';
        }
    }

    if (
        sectionParam === 'attempts' ||
        sectionParam === 'queue' ||
        sectionParam === 'logs' ||
        sectionParam === 'overview'
    ) {
        return sectionParam;
    }

    return DEFAULT_ACTIVE_SECTION;
}

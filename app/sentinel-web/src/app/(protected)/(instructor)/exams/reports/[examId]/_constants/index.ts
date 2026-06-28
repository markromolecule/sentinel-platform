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

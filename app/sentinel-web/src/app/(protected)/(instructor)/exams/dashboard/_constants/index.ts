import { type ExamStatus } from '@sentinel/shared/types';

export type ExamTabKey = 'all' | 'published' | 'drafts' | 'archived';

export const EXAMS_PER_PAGE = 6;

export const TAB_CONFIG: Array<{ value: ExamTabKey; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'published', label: 'Published' },
    { value: 'drafts', label: 'Drafts' },
    { value: 'archived', label: 'Archived' },
];

export const COLUMN_VIEW_CLASS_NAME =
    'grid grid-cols-1 content-start gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3';

export const LIST_VIEW_CLASS_NAME = 'grid grid-cols-1 gap-4';

export const TAB_PANEL_CLASS_NAME = 'flex min-h-[360px] flex-col gap-5';

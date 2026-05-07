export const DRAFT_KEY = 'sentinel-support-institution-setup-draft';

export const STEPS = [
    'Identity',
    'Academic terms',
    'Naming conventions',
    'Departments',
    'Courses',
    'Subjects',
    'Review',
] as const;

export const SUBJECT_HEADER_TOKENS = new Set([
    'code',
    'subject code',
    'subject_code',
    'title',
    'subject title',
    'subject_title',
]);

export const SUBJECT_BULK_PLACEHOLDER = `Code, Title
IT101, Introduction to Computing
GEACM01X, Advanced Communication`;

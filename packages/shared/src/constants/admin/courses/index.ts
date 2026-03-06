import { MOCK_COURSES } from '../../../mock-data';
import { CourseStoreState } from '../../../types/admin/courses';
// Constants for Course Query Keys
export const COURSE_QUERY_KEYS = {
    all: ['courses'] as const,
    detail: (id: string) => ['courses', id] as const,
    // lists: () => [...COURSE_QUERY_KEYS.all, 'list'] as const,
    // list: (filters: Record<string, string>) => [...COURSE_QUERY_KEYS.lists(), { filters }] as const,
};

export const MOCK_COURSES_LOCAL = MOCK_COURSES;

export const DEFAULT_COURSE_STORE_STATE: CourseStoreState = {
    courses: MOCK_COURSES_LOCAL,
};

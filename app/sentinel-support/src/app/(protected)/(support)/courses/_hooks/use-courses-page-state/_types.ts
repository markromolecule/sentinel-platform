import { Course } from '@sentinel/shared/types';

export type CourseFormState = {
    id?: string;
    code: string;
    title: string;
    departmentId: string;
    description: string;
    isInherited?: boolean;
};

export const EMPTY_COURSE_FORM: CourseFormState = {
    code: '',
    title: '',
    departmentId: '',
    description: '',
};

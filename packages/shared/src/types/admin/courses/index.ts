import { Course as SharedCourse } from '../../index';

export type Course = SharedCourse;

export type CourseStoreState = {
    courses: Course[];
};

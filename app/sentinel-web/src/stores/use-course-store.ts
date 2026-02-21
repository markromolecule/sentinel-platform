import { create, StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Course, CourseStoreState } from '@sentinel/shared/types';

import { MOCK_COURSES } from '@sentinel/shared/mock-data';

export type CourseStoreActions = {
    addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'createdBy'>) => void;
    updateCourse: (id: string, updates: Partial<Course>) => void;
    deleteCourse: (id: string) => void;
};

export type CourseStore = CourseStoreState & CourseStoreActions;

const DEFAULT_COURSE_STORE_STATE: CourseStoreState = {
    courses: MOCK_COURSES,
};

export const useCourseStore = create<CourseStore>()(
    immer<CourseStore>((set) => ({
        ...DEFAULT_COURSE_STORE_STATE,

        addCourse: (courseData) => {
            set((state) => {
                const newCourse: Course = {
                    id: crypto.randomUUID(),
                    ...courseData,
                    createdAt: new Date().toISOString(),
                    createdBy: 'Admin',
                };
                state.courses.push(newCourse);
            });
        },

        updateCourse: (id, updates) => {
            set((state) => {
                const index = state.courses.findIndex((c) => c.id === id);
                if (index !== -1) {
                    state.courses[index] = { ...state.courses[index], ...updates };
                }
            });
        },

        deleteCourse: (id) => {
            set((state) => {
                state.courses = state.courses.filter((c) => c.id !== id);
            });
        },
    })) as unknown as StateCreator<CourseStore, [], []>,
);

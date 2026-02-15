import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Course, CourseStoreState } from "@/app/(protected)/admin/courses/_types";

export type CourseStoreActions = {
    addCourse: (course: Omit<Course, "id" | "createdAt" | "createdBy">) => void;
    updateCourse: (id: string, updates: Partial<Course>) => void;
    deleteCourse: (id: string) => void;
};

export type CourseStore = CourseStoreState & CourseStoreActions;

const DEFAULT_COURSE_STORE_STATE: CourseStoreState = {
    courses: [
        // SECA
        {
            id: "1",
            code: "BSIT-MWA",
            title: "BS Information Technology with a Specialization in Mobile and Web Applications",
            department: "School of Engineering, Computing, and Architecture",
            createdAt: new Date().toISOString(),
            createdBy: "System",
        },
        {
            id: "2",
            code: "BSCS-ML",
            title: "BS Computer Science with a Specialization in Machine Learning",
            department: "School of Engineering, Computing, and Architecture",
            createdAt: new Date().toISOString(),
            createdBy: "System",
        },
        {
            id: "3",
            code: "BSARCH",
            title: "BS Architecture",
            department: "School of Engineering, Computing, and Architecture",
            createdAt: new Date().toISOString(),
            createdBy: "System",
        },
        {
            id: "4",
            code: "BSCpE",
            title: "BS Computer Engineering",
            department: "School of Engineering, Computing, and Architecture",
            createdAt: new Date().toISOString(),
            createdBy: "System",
        },
        {
            id: "5",
            code: "BSCE",
            title: "BS Civil Engineering",
            department: "School of Engineering, Computing, and Architecture",
            createdAt: new Date().toISOString(),
            createdBy: "System",
        },
        // SBMA
        {
            id: "6",
            code: "BSA",
            title: "BS Accountancy",
            department: "School of Business, Management, and Accountancy",
            createdAt: new Date().toISOString(),
            createdBy: "System",
        },
        {
            id: "7",
            code: "BSHM",
            title: "BS Hospitality Management",
            department: "School of Business, Management, and Accountancy",
            createdAt: new Date().toISOString(),
            createdBy: "System",
        },
        {
            id: "8",
            code: "BSMA",
            title: "BS Management Accounting",
            department: "School of Business, Management, and Accountancy",
            createdAt: new Date().toISOString(),
            createdBy: "System",
        },
        {
            id: "9",
            code: "BSTM",
            title: "BS Tourism Management",
            department: "School of Business, Management, and Accountancy",
            createdAt: new Date().toISOString(),
            createdBy: "System",
        },
        // SASE
        {
            id: "10",
            code: "BSPSY",
            title: "BS Psychology",
            department: "School of Arts, Sciences, and Education",
            createdAt: new Date().toISOString(),
            createdBy: "System",
        },
        {
            id: "11",
            code: "BAC",
            title: "BA Communication",
            department: "School of Arts, Sciences, and Education",
            createdAt: new Date().toISOString(),
            createdBy: "System",
        },
    ],
};

export const useCourseStore = create(
    immer<CourseStore>((set) => ({
        ...DEFAULT_COURSE_STORE_STATE,

        addCourse: (courseData) => {
            set((state) => {
                const newCourse: Course = {
                    id: crypto.randomUUID(),
                    ...courseData,
                    createdAt: new Date().toISOString(),
                    createdBy: "Admin",
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
    }))
);

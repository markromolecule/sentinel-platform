export interface Course {
    id: string;
    code: string; // e.g., "BSIT-MWA"
    title: string; // e.g., "Bachelor of Science in Information Technology - Mobile Web Applications"
    department: string;
    description?: string;
    createdAt: string;
    createdBy: string;
}

export type CourseStoreState = {
    courses: Course[];
};

export type SectionStatus = "active" | "archived" | "inactive";

export interface Section {
    id: string;
    courseId: string; // Link to Course
    name: string; // e.g., "INF231" (Section Name)
    department: string; // Inherited from Course or independent? Plan says "Department" is on Course.
                       // But sections might still display it. Let's keep it for now or make it optional?
                       // Plan: "Course (Program): Represents the degree... It can have its own properties like Department"
                       // "Section... only needs to know which course it belongs to"
                       // But for now, let's keep department on section for easier display, or remove it if we strictly follow normalization.
                       // Implementation Plan says: "Section Management... 'Course' column: Look up course... using courseId".
                       // It doesn't explicitly say remove department from section, but it implies normalization.
                       // However, `sections-list` displays department.
                       // Let's keep `department` in Section for now to avoid breaking too much, or better, remove `courseName` and add `courseId`.

    yearLevel: string; // e.g., "3rd Year"
    status: SectionStatus;
    createdAt: string;
    createdBy: string;
}

export type SectionStoreState = {
    sections: Section[];
};

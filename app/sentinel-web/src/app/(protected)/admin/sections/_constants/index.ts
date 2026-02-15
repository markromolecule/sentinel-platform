import { Section, SectionStoreState } from "../_types";

export const MOCK_SECTIONS: Section[] = [
    {
        id: "1",
        courseId: "1", // BSIT-MWA
        name: "1A", 
        department: "School of Engineering, Computing, and Architecture",
        yearLevel: "1st Year",
        status: "active",
        createdAt: new Date().toISOString(),
        createdBy: "System Admin",
    },
    {
        id: "2",
        courseId: "1", // BSIT-MWA
        name: "1B",
        department: "School of Engineering, Computing, and Architecture",
        yearLevel: "1st Year",
        status: "active",
        createdAt: new Date().toISOString(),
        createdBy: "System Admin",
    },
    {
        id: "3",
        courseId: "2", // BSCS-ML
        name: "2A",
        department: "School of Engineering, Computing, and Architecture",
        yearLevel: "2nd Year",
        status: "active",
        createdAt: new Date().toISOString(),
        createdBy: "System Admin",
    },
    {
        id: "4",
        courseId: "6", // BSA
        name: "1A",
        department: "School of Business, Management, and Accountancy",
        yearLevel: "1st Year",
        status: "active",
        createdAt: new Date().toISOString(),
        createdBy: "System Admin",
    },
];

export const DEFAULT_SECTION_STORE_STATE: SectionStoreState = {
    sections: MOCK_SECTIONS,
};

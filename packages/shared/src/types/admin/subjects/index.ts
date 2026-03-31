import { type Subject } from '../../index';

export type MasterSubject = {
    id?: string;
    code: string;
    title: string;
    termId?: string | null;
    isOpened?: boolean;
    offeringStartDate?: Date | string | null;
    offeringEndDate?: Date | string | null;
    departmentIds?: string[];
    courseIds?: string[];
    sectionIds?: string[];
    yearLevels?: number[];
    createdAt?: Date | string | null;
    createdBy?: string | null;
    updatedAt?: Date | string | null;
    updatedBy?: string | null;
    // Legacy fields retained for compatibility with existing proctor mock flows.
    department?: string;
    yearLevel?: string;
    sections?: string[];
};

export type SubjectStoreState = {
    subjects: Subject[];
    masterSubjects: MasterSubject[];
};

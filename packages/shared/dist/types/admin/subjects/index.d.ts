import { type Subject } from '../../index';
export type MasterSubject = {
    id?: string;
    code: string;
    title: string;
    departmentIds?: string[];
    courseIds?: string[];
    sectionIds?: string[];
    yearLevels?: number[];
    createdAt?: Date | string | null;
    createdBy?: string | null;
    updatedAt?: Date | string | null;
    updatedBy?: string | null;
    department?: string;
    yearLevel?: string;
    sections?: string[];
};
export type SubjectStoreState = {
    subjects: Subject[];
    masterSubjects: MasterSubject[];
};
//# sourceMappingURL=index.d.ts.map
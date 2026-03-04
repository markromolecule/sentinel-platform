import { type Subject } from '../../index';
export type MasterSubject = {
    code: string;
    title: string;
    department: string;
    yearLevel: string;
    sections: string[];
};
export type SubjectStoreState = {
    subjects: Subject[];
    masterSubjects: MasterSubject[];
};
//# sourceMappingURL=index.d.ts.map
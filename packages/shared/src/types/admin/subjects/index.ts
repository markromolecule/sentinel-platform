import { type Subject } from '../../index';

// Define the state type
export type MasterSubject = {
    code: string;
    title: string;
    department: string;
    yearLevel: string;
    sections: string[]; // List of Section Names (e.g. ["BSCS-1A", "BSCS-1B"])
};

export type SubjectStoreState = {
    subjects: Subject[];
    masterSubjects: MasterSubject[];
};

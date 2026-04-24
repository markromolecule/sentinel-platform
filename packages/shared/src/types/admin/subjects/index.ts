import {
    type ClassificationSubjectOfferingResult as SharedClassificationSubjectOfferingResult,
    type SkippedSubjectOffering as SharedSkippedSubjectOffering,
    type Subject,
} from '../../index';

export type SubjectClassificationType = 'GENERAL' | 'CORE';

export type SubjectClassificationSummary = {
    id: string;
    name: string;
    type: SubjectClassificationType;
};

export type SubjectClassificationSubject = {
    id: string;
    code: string;
    title: string;
};

export type SubjectClassification = SubjectClassificationSummary & {
    description?: string | null;
    subjectCount: number;
    subjects: SubjectClassificationSubject[];
    department_id?: string | null;
    course_ids?: string[];
    createdAt?: Date | string | null;
    createdBy?: string | null;
    updatedAt?: Date | string | null;
    updatedBy?: string | null;
};

export type MasterSubject = {
    id?: string;
    subject_id?: string; // API alias
    code: string;
    subject_code?: string; // API alias
    title: string;
    subject_title?: string; // API alias
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
    classifications?: SubjectClassificationSummary[];
    // Legacy fields retained for compatibility with existing proctor mock flows.
    department?: string;
    yearLevel?: string;
    sections?: string[];
};

export type SubjectStoreState = {
    subjects: Subject[];
    masterSubjects: MasterSubject[];
};

export type SkippedSubjectOffering = SharedSkippedSubjectOffering;
export type ClassificationSubjectOfferingResult = SharedClassificationSubjectOfferingResult;

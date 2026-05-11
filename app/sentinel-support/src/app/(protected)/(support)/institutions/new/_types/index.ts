export type InstitutionKind = 'STANDALONE' | 'PARENT' | 'CHILD';

export type SimpleInstitution = {
    id: string;
    name: string;
    institutionKind: InstitutionKind;
};

export type WizardDepartment = {
    clientId: string;
    name: string;
    code: string;
};

export type WizardCourse = {
    clientId: string;
    title: string;
    code: string;
    departmentClientId: string;
};

export type RoomType = 'LECTURE' | 'LABORATORY' | 'VIRTUAL';

export type WizardTerm = {
    clientId: string;
    academicYear: string;
    semester: string;
    isActive: boolean;
    startDate: string;
    endDate: string;
};

export type WizardSubject = {
    clientId: string;
    code: string;
    title: string;
};

export type SectionNamingRule = {
    courseClientId: string;
    format: string;
    preview: string;
};

export type WizardDraft = {
    identity: {
        name: string;
        code: string;
        institutionKind: InstitutionKind;
        parentInstitutionId: string;
    };
    departments: WizardDepartment[];
    courses: WizardCourse[];
    terms: WizardTerm[];
    subjects: WizardSubject[];
    naming: {
        room: {
            label: string;
            prefix: string;
            virtualPrefix: string;
        };
        sectionRulesByCourseClientId: Record<string, SectionNamingRule>;
    };
};

export type SubjectImportRow = {
    code: string;
    title: string;
    sourceLabel: string;
};

export type SubjectImportPreview = {
    rows: SubjectImportRow[];
    errors: string[];
};

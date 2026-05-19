export type EnrollmentSectionOption = {
    id: string;
    name: string;
    yearLevel: string;
};

export type EnrollmentSubjectOption = {
    id: string;
    code: string;
    title: string;
    term: string;
    yearLevel: string;
    sections: EnrollmentSectionOption[];
};

export type StudentImportClaimStatus =
    | 'CLAIMED'
    | 'UNCLAIMED'
    | 'NOT_WHITELISTED'
    | 'ALREADY_ENROLLED'
    | 'UNKNOWN';

export type StudentImportRow = {
    studentNo: string;
    firstName: string;
    lastName: string;
    section: string;
    subject: string;
    term: string;
    claimStatus: StudentImportClaimStatus;
    reason?: string | null;
};

export type StudentImportParseResult = {
    students: StudentImportRow[];
    errors: string[];
};

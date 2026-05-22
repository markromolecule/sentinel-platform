import type { StudentImportClaimStatus, StudentImportRow } from './enrollment-target';

export type ParsedStudent = Omit<StudentImportRow, 'claimStatus' | 'reason'>;

export type ParsedWorksheetResult = {
    students: ParsedStudent[];
    errors: string[];
};

export type StudentEnrollmentPreviewResult = {
    studentNumber: string;
    claimStatus: StudentImportClaimStatus;
    reason?: string | null;
};

export type PreviewStudentEnrollmentResponse = {
    data: {
        results: StudentEnrollmentPreviewResult[];
    };
};

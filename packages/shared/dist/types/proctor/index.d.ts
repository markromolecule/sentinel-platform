import { ProctorInfo, Student as SharedStudent, Exam as SharedExam } from '..';
export type { ProctorInfo };
export interface Student extends SharedStudent {
    /** @deprecated Use createdAt */
    enrolledAt?: string;
    yearLevel?: string;
}
export interface ProctorExam extends SharedExam {
    studentsCount: number;
    createdBy?: string;
    createdAt: string;
}
export type EnrollmentFileColumn = 'student_no' | 'first_name' | 'last_name' | 'section' | 'subject' | 'term';
export type EnrollmentFileResult = {
    success: boolean;
    data: Omit<Student, 'id' | 'enrolledAt' | 'userId' | 'role' | 'studentNo'> & {
        studentNo: string;
    }[];
    errors: string[];
    detectedColumns: EnrollmentFileColumn[];
};
export type NavigationItem = {
    label: string;
    href: string;
    icon: string;
};
//# sourceMappingURL=index.d.ts.map
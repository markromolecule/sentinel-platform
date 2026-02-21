export type GradingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface GradingExam {
    id: string;
    title: string;
    subject: string;
    date: string;
    totalStudents: number;
    gradedCount: number;
    status: GradingStatus;
}

export type SubmissionStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'GRADED';

export interface GradingStudent {
    id: string;
    name: string;
    studentId: string;
    submissionDate?: string;
    score?: number;
    maxScore: number;
    status: SubmissionStatus;
    feedback?: string;
}

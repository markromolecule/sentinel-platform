import type {
    GradingExamType,
    GradingStudentListType,
    GradingStudentSectionType,
    GradingStudentType,
    gradingStatusSchema,
    submissionStatusSchema,
} from '../../../schema';
import type { z } from 'zod';

export type GradingStatus = z.infer<typeof gradingStatusSchema>;
export type GradingExam = GradingExamType;

export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;
export type GradingStudent = GradingStudentType;
export type GradingStudentSection = GradingStudentSectionType;
export type GradingStudentList = GradingStudentListType;

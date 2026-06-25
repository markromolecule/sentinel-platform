import { ExamHistory } from '@sentinel/shared/types';
import type { AttemptGradingDetailType, GradingQuestionType } from '@sentinel/shared';

export type StudentHistoryReportAvailability = 'available' | 'grading_in_progress' | 'unavailable';

export interface UseExamDetailsReturn {
    examId: string | null;
    attemptId: string | null;
    historyItem: ExamHistory | undefined;
    report:
        | {
              attempt: AttemptGradingDetailType;
              questions: GradingQuestionType[];
          }
        | undefined;
    reportAvailability: StudentHistoryReportAvailability;
    isLoading: boolean;
}

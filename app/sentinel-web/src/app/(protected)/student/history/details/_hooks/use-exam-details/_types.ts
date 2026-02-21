import { ExamHistory } from '@sentinel/shared/types';;

export interface UseExamDetailsReturn {
    examId: string | null;
    historyItem: ExamHistory | undefined;
    isLoading: boolean;
}

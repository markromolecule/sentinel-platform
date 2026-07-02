import { useSearchParams } from 'next/navigation';
import { useAttemptReportQuery, useExamHistoryDetailQuery, useExamQuery } from '@sentinel/hooks';
import { ApiError } from '@sentinel/services';
import type { ExamHistory } from '@sentinel/shared/types';
import {
    UseExamDetailsArgs,
    UseExamDetailsReturn,
} from '@/app/(protected)/student/history/details/_hooks/use-exam-details/_types';

/**
 * Resolves student history detail state from explicit route params, with legacy
 * search-param support preserved for compatibility redirects.
 *
 * @param args - Optional route-derived attempt or exam identifiers.
 * @returns Student history detail query state and report availability.
 */
export function useExamDetails(args: UseExamDetailsArgs = {}): UseExamDetailsReturn {
    const searchParams = useSearchParams();
    const attemptId =
        args.attemptId !== undefined ? args.attemptId : (searchParams.get('attemptId') ?? null);
    const examId =
        args.examId !== undefined
            ? args.examId
            : ((searchParams.get('examId') ?? searchParams.get('id')) || null);
    const { data: historyItem, isLoading: isHistoryLoading } = useExamHistoryDetailQuery(attemptId);
    const { data: exam, isLoading: isExamLoading } = useExamQuery(examId ?? undefined);
    const reportQuery = useAttemptReportQuery(attemptId);
    const hasAttemptId = Boolean(attemptId);

    const fallbackHistoryItem: ExamHistory | undefined =
        !historyItem && exam
            ? {
                  id: exam.id,
                  attemptId: exam.attemptId ?? null,
                  examId: exam.id,
                  examTitle: exam.title,
                  subject: exam.subject,
                  sectionName: exam.section ?? null,
                  availableAt: exam.scheduledDate ?? exam.publishedAt ?? null,
                  dueAt: exam.endDateTime ?? exam.scheduledDate ?? null,
                  completedAt: exam.completedAt ?? null,
                  score: exam.score ?? null,
                  totalScore: exam.totalScore ?? null,
                  percentage: exam.percentage ?? null,
                  status:
                      exam.status === 'past_due'
                          ? 'past_due'
                          : exam.status === 'turned_in'
                            ? 'turned_in'
                            : 'upcoming',
                  result:
                      typeof exam.percentage === 'number'
                          ? exam.percentage >= exam.passingScore
                              ? 'passed'
                              : 'failed'
                          : null,
                  timeSpent: exam.timeSpentMinutes ?? null,
                  cheated: exam.cheated ?? false,
                  cheatingType: exam.cheatingType ?? null,
                  incidentCount: exam.incidentCount ?? 0,
                  durationMinutes: exam.duration,
                  passingScore: exam.passingScore,
                  roomName: exam.room ?? null,
              }
            : undefined;

    const reportAvailability = reportQuery.data
        ? 'available'
        : hasAttemptId && reportQuery.isLoading
          ? 'loading_report'
          : reportQuery.error instanceof ApiError && reportQuery.error.status === 409
            ? 'grading_in_progress'
            : 'unavailable';

    return {
        examId,
        attemptId,
        historyItem: historyItem ?? fallbackHistoryItem,
        report: reportQuery.data,
        reportAvailability,
        isLoading: hasAttemptId ? isHistoryLoading : isExamLoading,
    };
}

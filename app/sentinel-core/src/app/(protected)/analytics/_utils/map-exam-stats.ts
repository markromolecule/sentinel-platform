import { ExamCompletionMetric } from '@sentinel/services';

export interface ExamStats {
    /** Percentage of exam sessions completed successfully (0–100) */
    completionRate: number;
    /** Percentage of exam sessions dropped/abandoned (0–100) */
    dropRate: number;
    /** Total completed sessions */
    totalCompleted: number;
    /** Total dropped sessions */
    totalDropped: number;
    /** Total sessions (completed + dropped) */
    totalSessions: number;
}

/**
 * Computes summary exam statistics from raw daily completion metric data.
 * Safe against empty arrays and zero-division.
 *
 * @param data - Array of daily exam completion metrics from the API.
 * @returns Computed stats including completion rate, drop rate, and totals.
 */
export function mapExamStats(data: ExamCompletionMetric[]): ExamStats {
    if (!data || data.length === 0) {
        return {
            completionRate: 0,
            dropRate: 0,
            totalCompleted: 0,
            totalDropped: 0,
            totalSessions: 0,
        };
    }

    const totalCompleted = data.reduce((sum, item) => sum + (item.completed ?? 0), 0);
    const totalDropped = data.reduce((sum, item) => sum + (item.dropped ?? 0), 0);
    const totalSessions = totalCompleted + totalDropped;

    if (totalSessions === 0) {
        return {
            completionRate: 0,
            dropRate: 0,
            totalCompleted,
            totalDropped,
            totalSessions,
        };
    }

    const completionRate = Math.round((totalCompleted / totalSessions) * 100 * 10) / 10;
    const dropRate = Math.round((totalDropped / totalSessions) * 100 * 10) / 10;

    return {
        completionRate,
        dropRate,
        totalCompleted,
        totalDropped,
        totalSessions,
    };
}

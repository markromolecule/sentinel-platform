import { type DbClient } from '@sentinel/db';
import { resolveExaminationGlobalSettings } from '../../configuration/configuration.service';
import { getExamsData } from '../../exams/data/get-exams';
import type { ExamHistorySummary } from '../history.dto';
import { mapExamHistorySummaryResponse } from '../../exams/services/map-exam-response.service';
import { applyEffectiveExamBaselineToRawRecord } from '../../exams/services/resolve-effective-exam-baseline.service';

export async function getStudentExamHistory(
    dbClient: DbClient,
    studentUserId: string,
    institutionId?: string,
    filters?: {
        page?: number;
        limit?: number;
        status?: 'turned_in' | 'past_due';
        search?: string;
    },
): Promise<{ items: ExamHistorySummary[]; total: number; hasMore: boolean }> {
    const [records, globalSettings] = await Promise.all([
        getExamsData({
            dbClient,
            institutionId,
            filters: {
                search: filters?.search,
            },
            studentUserId,
        }),
        resolveExaminationGlobalSettings(dbClient),
    ]);

    let items = records.map((record) =>
        mapExamHistorySummaryResponse(
            applyEffectiveExamBaselineToRawRecord(record, globalSettings),
        ),
    );

    if (filters?.status) {
        items = items.filter((item) => item.status === filters.status);
    } else {
        // Default to only history statuses (turned_in and past_due)
        items = items.filter((item) => item.status === 'turned_in' || item.status === 'past_due');
    }

    // Sort items by completion/due date descending
    items.sort((left, right) => {
        const leftDate = left.completedAt ?? left.dueAt ?? left.availableAt;
        const rightDate = right.completedAt ?? right.dueAt ?? right.availableAt;
        if (!leftDate) return 1;
        if (!rightDate) return -1;
        return new Date(rightDate).getTime() - new Date(leftDate).getTime();
    });

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const offset = (page - 1) * limit;
    const total = items.length;
    const paginatedItems = items.slice(offset, offset + limit);
    const hasMore = offset + paginatedItems.length < total;

    return {
        items: paginatedItems,
        total,
        hasMore,
    };
}

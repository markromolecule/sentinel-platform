import { type DbClient } from '@sentinel/db';
import type { GradingExamType } from '@sentinel/shared/schema';
import { getGradingExamsData } from '../data/get-grading-exams';

export type GetGradingExamsArgs = {
    dbClient: DbClient;
    userId?: string | null;
    institutionId?: string;
    sectionId?: string;
};

export async function getGradingExams({
    dbClient,
    userId,
    institutionId,
    sectionId,
}: GetGradingExamsArgs): Promise<GradingExamType[]> {
    const records = await getGradingExamsData({
        dbClient,
        userId: userId ?? undefined,
        institutionId,
        sectionId,
    });

    return records.map((record) => {
        let status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' = 'PENDING';

        if (record.submittedCount > 0) {
            status = record.gradedCount >= record.submittedCount ? 'COMPLETED' : 'IN_PROGRESS';
        }

        return {
            id: record.id,
            title: record.title,
            subject: record.subject ?? 'Unknown Subject',
            scheduledDate: record.scheduledDate ? record.scheduledDate.toISOString() : null,
            totalStudents: record.totalStudents,
            submittedCount: record.submittedCount,
            gradedCount: record.gradedCount,
            status,
            sectionIds: record.sectionIds ?? [],
            sectionNames: record.sectionNames ?? [],
        };
    });
}

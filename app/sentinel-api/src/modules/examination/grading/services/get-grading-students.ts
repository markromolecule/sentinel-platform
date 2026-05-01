import { type DbClient } from '@sentinel/db';
import type { GradingStudentType } from '@sentinel/shared/schema';
import { getGradingStudentsData } from '../data/get-grading-students';

export type GetGradingStudentsArgs = {
    dbClient: DbClient;
    examId: string;
    userId?: string | null;
    institutionId?: string;
    sectionId?: string;
};

export async function getGradingStudents({
    dbClient,
    examId,
    userId,
    institutionId,
    sectionId,
}: GetGradingStudentsArgs): Promise<GradingStudentType[]> {
    const records = await getGradingStudentsData({
        dbClient,
        examId,
        userId: userId ?? undefined,
        institutionId,
        sectionId,
    });

    return records
        .map((record) => {
            let status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'GRADED' = 'NOT_SUBMITTED';

            if (record.completed_at) {
                if (record.score !== null && record.score !== undefined) {
                    status = 'GRADED';
                } else {
                    status = 'SUBMITTED';
                }
            }

            return {
                id: record.id,
                name: record.name ?? 'Unknown Student',
                studentId: record.studentId,
                sectionId: record.sectionId ?? null,
                sectionName: record.sectionName ?? null,
                submissionDate: record.completed_at ? record.completed_at.toISOString() : null,
                score: record.score ?? null,
                maxScore: Number(record.maxScore ?? 0),
                status,
                attemptId: record.attemptId ?? null,
            };
        })
        .sort((left, right) => left.name.localeCompare(right.name));
}

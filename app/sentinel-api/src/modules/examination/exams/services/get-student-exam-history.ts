import { type DbClient } from '@sentinel/db';
import { getExamsData } from '../data/get-exams';
import type { ExamHistorySummary } from '../exam.dto';
import { mapExamHistorySummaryResponse } from './map-exam-response';

export async function getStudentExamHistory(
    dbClient: DbClient,
    studentUserId: string,
    institutionId?: string,
): Promise<ExamHistorySummary[]> {
    const records = await getExamsData({
        dbClient,
        institutionId,
        filters: {},
        studentUserId,
    });

    return records.map(mapExamHistorySummaryResponse);
}

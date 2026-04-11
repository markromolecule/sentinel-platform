import { type DbClient } from '@sentinel/db';
import type { GetExamsQuery } from '../exam.dto';
import { getExamsData } from '../data/get-exams';
import { mapExamSummaryResponse } from './map-exam-response';

export async function getExams(dbClient: DbClient, filters: GetExamsQuery, institutionId?: string) {
    const records = await getExamsData({
        dbClient,
        institutionId,
        filters,
    });

    const exams = records.map(mapExamSummaryResponse);

    if (filters.status) {
        return exams.filter((exam) => exam.status === filters.status);
    }

    return exams;
}

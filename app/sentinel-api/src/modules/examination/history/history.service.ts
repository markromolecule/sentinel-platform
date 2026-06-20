import { type DbClient } from '@sentinel/db';
import { getStudentExamHistory } from './services/get-student-exam-history';
import { getStudentExamHistoryDetail } from './services/get-student-exam-history-detail';

export class HistoryService {
    static async getStudentHistory(
        dbClient: DbClient,
        studentUserId: string,
        institutionId?: string,
        filters?: {
            page?: number;
            limit?: number;
            status?: 'turned_in' | 'past_due';
            search?: string;
        },
    ) {
        return await getStudentExamHistory(dbClient, studentUserId, institutionId, filters);
    }

    static async getStudentHistoryDetail(
        dbClient: DbClient,
        attemptId: string,
        studentUserId: string,
        institutionId?: string,
    ) {
        return await getStudentExamHistoryDetail(dbClient, attemptId, studentUserId, institutionId);
    }
}

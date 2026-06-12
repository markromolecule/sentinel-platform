import { type DbClient } from '@sentinel/db';
import { getGradingExams as getGradingExamsService } from './services/get-grading-exams';
import { getGradingStudents as getGradingStudentsService } from './services/get-grading-students';
import { getGradingAttemptDetail as getGradingAttemptDetailService } from './services/get-grading-attempt-detail';
import { updateGradingAttempt as updateGradingAttemptService, type UpdateGradingAttemptArgs } from './services/update-grading-attempt';

export class GradingService {
    static async getGradingExams(params: {
        dbClient: DbClient;
        userId?: string;
        institutionId?: string;
        sectionId?: string;
    }) {
        return await getGradingExamsService(params);
    }

    static async getGradingStudents(params: {
        dbClient: DbClient;
        examId: string;
        userId?: string;
        institutionId?: string;
        sectionId?: string;
    }) {
        return await getGradingStudentsService(params);
    }

    static async getGradingAttemptDetail(params: {
        dbClient: DbClient;
        attemptId: string;
        institutionId?: string;
    }) {
        return await getGradingAttemptDetailService(params);
    }

    static async updateGradingAttempt(params: UpdateGradingAttemptArgs) {
        return await updateGradingAttemptService(params);
    }
}


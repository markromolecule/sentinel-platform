import { type DbClient } from '@sentinel/db';
import { getGradingExams as getGradingExamsService } from './services/get-grading-exams';
import { getGradingStudents as getGradingStudentsService } from './services/get-grading-students';

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
}

import { type DbClient } from '@sentinel/db';
import type { AssessmentAllowedRole } from '../assessment/assessment-access';
import { getAttemptReport } from './services/get-attempt-report';
import { getExamReport } from './services/get-exam-report';

export class ReportingService {
    static async getExamReport(args: {
        dbClient: DbClient;
        examId: string;
        institutionId?: string;
        viewerRole: AssessmentAllowedRole;
        userId?: string | null;
    }) {
        return getExamReport(args);
    }

    static async getAttemptReport(args: {
        dbClient: DbClient;
        attemptId: string;
        institutionId?: string;
        viewerRole: AssessmentAllowedRole | 'student';
        userId?: string | null;
    }) {
        return getAttemptReport(args);
    }
}

import { type DbClient } from '@sentinel/db';
import type { AssessmentAllowedRole } from '../assessment/assessment-access';
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
}

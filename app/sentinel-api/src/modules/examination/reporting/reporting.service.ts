import { type DbClient } from '@sentinel/db';
import type { AssessmentAllowedRole } from '../assessment/assessment-access';
import { getAttemptReport } from './services/get-attempt-report';
import { getExamReport } from './services/get-exam-report';

type GetExamReportArgs = Parameters<typeof getExamReport>[0];

export class ReportingService {
    static async getExamReport(args: GetExamReportArgs) {
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

import { type DbClient } from '@sentinel/db';
import type { AssessmentAllowedRole } from '../assessment/assessment-access';
import { getExamMonitoringOverview } from './services/get-exam-monitoring-overview';
import { getExamMonitoringStudentDetail } from './services/get-exam-monitoring-student-detail';

export class MonitoringService {
    static async getExamMonitoringOverview(args: {
        dbClient: DbClient;
        examId: string;
        institutionId?: string;
        viewerRole: AssessmentAllowedRole;
        userId?: string | null;
    }) {
        return getExamMonitoringOverview(args);
    }

    static async getExamMonitoringStudentDetail(args: {
        dbClient: DbClient;
        examId: string;
        studentId: string;
        institutionId?: string;
        viewerRole: AssessmentAllowedRole;
        userId?: string | null;
    }) {
        return getExamMonitoringStudentDetail(args);
    }
}

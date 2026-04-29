import type { MonitoringOverview, StudentSession } from '@sentinel/shared/types';
import type { ApiClientType } from '../../api-client';
import { mapExamRuntimeAccess, mapMonitoringStudent } from './mappers';
import type { ApiExamResponse, ApiMonitoringOverview, ApiMonitoringStudentDetail } from './types';

export async function getExamMonitoringOverview(
    apiClient: ApiClientType,
    examId: string,
): Promise<MonitoringOverview> {
    const response: ApiExamResponse<ApiMonitoringOverview> = await apiClient(
        `/exams/${examId}/monitoring`,
    );

    return {
        exam: {
            id: response.data.exam.id,
            title: response.data.exam.title,
            subject: response.data.exam.subject,
            scheduledDate: response.data.exam.scheduledDate ?? null,
            endDateTime: response.data.exam.endDateTime ?? null,
            maxReconnectAttempts: response.data.exam.maxReconnectAttempts ?? 0,
            runtimeAccess: mapExamRuntimeAccess(response.data.exam.runtimeAccess),
        },
        stats: response.data.stats,
        lobbyAdmissions: response.data.lobbyAdmissions,
        students: response.data.students.map(mapMonitoringStudent),
    };
}

export async function getExamMonitoringStudentDetail(
    apiClient: ApiClientType,
    examId: string,
    studentId: string,
): Promise<StudentSession> {
    const response: ApiExamResponse<ApiMonitoringStudentDetail> = await apiClient(
        `/exams/${examId}/monitoring/students/${studentId}`,
    );

    return mapMonitoringStudent(response.data);
}

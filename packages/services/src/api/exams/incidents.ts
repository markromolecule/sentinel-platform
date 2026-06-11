import type { ApiClientType } from '../../api-client';
import type {
    ApiGetExamIncidentsQuery,
    ApiGetExamIncidentsResponse,
    ApiReviewExamIncidentsPayload,
    ApiReviewExamIncidentsResponse,
} from './types';

/**
 * Fetches paginated, filtered telemetry incidents for a specific exam.
 *
 * @param apiClient - The base API client.
 * @param examId - The UUID of the exam.
 * @param query - The filtering and pagination parameters.
 */
export async function getExamIncidents(
    apiClient: ApiClientType,
    examId: string,
    query: ApiGetExamIncidentsQuery = {},
): Promise<ApiGetExamIncidentsResponse> {
    const queryParams = new URLSearchParams();

    if (query.sectionId) queryParams.append('sectionId', query.sectionId);
    if (query.studentId) queryParams.append('studentId', query.studentId);
    if (query.severity) queryParams.append('severity', query.severity);
    if (query.type) queryParams.append('type', query.type);
    if (query.status) queryParams.append('status', query.status);
    if (query.page !== undefined) queryParams.append('page', String(query.page));
    if (query.limit !== undefined) queryParams.append('limit', String(query.limit));

    const queryString = queryParams.toString();
    const url = queryString ? `/exams/${examId}/incidents?${queryString}` : `/exams/${examId}/incidents`;

    return apiClient(url);
}

/**
 * Confirms or dismisses one or many student incidents.
 *
 * @param apiClient - The base API client.
 * @param examId - The UUID of the exam.
 * @param payload - The body parameters containing incidentIds, status, and reviewNotes.
 */
export async function reviewIncidents(
    apiClient: ApiClientType,
    examId: string,
    payload: ApiReviewExamIncidentsPayload,
): Promise<ApiReviewExamIncidentsResponse> {
    return apiClient(`/exams/${examId}/incidents/review`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}

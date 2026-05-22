import type { ApiClientType } from '../api-client';

export interface AnalyticsKPIsSummary {
    totalExams: number;
    totalAttempts: number;
    completedAttempts: number;
    totalIncidents: number;
    flaggedAttempts: number;
    activeExams: number;
    integrityIndex: number;
}

export interface ExamCompletionMetric {
    name: string;
    completed: number;
    dropped: number;
}

export interface IncidentTrendMetric {
    name: string;
    incidents: number;
}

export interface IncidentSeverityDistribution {
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    count: number;
    percentage: number;
}

export interface IncidentTypeDistribution {
    type: string;
    count: number;
    percentage: number;
}

export interface DepartmentIntegrityMetric {
    department: string;
    completed: number;
    flagged: number;
    dropped: number;
}

export interface AnalyticsReport {
    reportId: string;
    title: string;
    type: string;
    generatedAt: string | null;
    format: string | null;
    status: string | null;
    fileUrl: string | null;
    createdBy: string | null;
    creatorFirstName?: string | null;
    creatorLastName?: string | null;
}

export interface PaginatedAnalyticsReports {
    records: AnalyticsReport[];
    total_records: number;
    limit: number;
    page: number;
}

export interface GenerateAnalyticsReportBody {
    title: string;
    type: 'completion' | 'incident' | 'performance';
    format: 'pdf' | 'csv' | 'xlsx';
}

export interface GetAnalyticsParams {
    institution_id?: string;
}

export interface GetAnalyticsReportsParams extends GetAnalyticsParams {
    limit?: number;
    page?: number;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

/**
 * Builds a query string with institution_id.
 *
 * @param params Query parameters.
 * @returns Query string starting with ? or empty string.
 */
function buildQueryString(params?: GetAnalyticsParams): string {
    if (!params) {
        return '';
    }

    const searchParams = new URLSearchParams();

    if (params.institution_id) {
        searchParams.set('institution_id', params.institution_id);
    }

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

/**
 * Fetches high-level KPI summaries for analytics.
 *
 * @param apiClient The API client instance.
 * @param params Optional query parameters (institution_id).
 * @returns A promise resolving to the analytics KPI summary.
 */
export async function getAnalyticsKPIs(
    apiClient: ApiClientType,
    params?: GetAnalyticsParams,
): Promise<AnalyticsKPIsSummary> {
    const query = buildQueryString(params);
    const response: ApiResponse<AnalyticsKPIsSummary> = await apiClient(`/analytics/kpis${query}`);
    return response.data;
}

/**
 * Fetches incident severity distribution metrics.
 *
 * @param apiClient The API client instance.
 * @param params Optional query parameters (institution_id).
 * @returns A promise resolving to an array of severity distribution objects.
 */
export async function getAnalyticsIncidentSeverity(
    apiClient: ApiClientType,
    params?: GetAnalyticsParams,
): Promise<IncidentSeverityDistribution[]> {
    const query = buildQueryString(params);
    const response: ApiResponse<IncidentSeverityDistribution[]> = await apiClient(
        `/analytics/incident-severity${query}`,
    );
    return response.data;
}

/**
 * Fetches incident type distribution metrics.
 *
 * @param apiClient The API client instance.
 * @param params Optional query parameters (institution_id).
 * @returns A promise resolving to an array of incident type distribution objects.
 */
export async function getAnalyticsIncidentType(
    apiClient: ApiClientType,
    params?: GetAnalyticsParams,
): Promise<IncidentTypeDistribution[]> {
    const query = buildQueryString(params);
    const response: ApiResponse<IncidentTypeDistribution[]> = await apiClient(
        `/analytics/incident-type${query}`,
    );
    return response.data;
}

/**
 * Fetches department integrity metrics (completed, dropped, flagged counts).
 *
 * @param apiClient The API client instance.
 * @param params Optional query parameters (institution_id).
 * @returns A promise resolving to an array of department integrity metric objects.
 */
export async function getAnalyticsDepartmentIntegrity(
    apiClient: ApiClientType,
    params?: GetAnalyticsParams,
): Promise<DepartmentIntegrityMetric[]> {
    const query = buildQueryString(params);
    const response: ApiResponse<DepartmentIntegrityMetric[]> = await apiClient(
        `/analytics/department-integrity${query}`,
    );
    return response.data;
}

/**
 * Fetches a paginated list of generated analytics reports.
 *
 * @param apiClient The API client instance.
 * @param params Optional query and pagination parameters (institution_id, limit, page).
 * @returns A promise resolving to a paginated analytics reports object.
 */
export async function getAnalyticsReports(
    apiClient: ApiClientType,
    params?: GetAnalyticsReportsParams,
): Promise<PaginatedAnalyticsReports> {
    const searchParams = new URLSearchParams();

    if (params) {
        if (params.institution_id) {
            searchParams.set('institution_id', params.institution_id);
        }
        if (params.limit !== undefined) {
            searchParams.set('limit', String(params.limit));
        }
        if (params.page !== undefined) {
            searchParams.set('page', String(params.page));
        }
    }

    const query = searchParams.toString();
    const response: ApiResponse<PaginatedAnalyticsReports> = await apiClient(
        `/analytics/reports${query ? `?${query}` : ''}`,
    );
    return response.data;
}

/**
 * Triggers/generates a new analytics report.
 *
 * @param apiClient The API client instance.
 * @param payload The request payload containing title, type, and format of the report.
 * @returns A promise resolving to the created report object.
 */
export async function generateAnalyticsReport(
    apiClient: ApiClientType,
    payload: GenerateAnalyticsReportBody,
): Promise<AnalyticsReport> {
    const response: ApiResponse<AnalyticsReport> = await apiClient('/analytics/reports', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return response.data;
}

/**
 * Fetches daily exam completion statistics (completed vs dropped breakdown by day of week).
 *
 * @param apiClient The API client instance.
 * @param params Optional query parameters (institution_id).
 * @returns A promise resolving to an array of daily completion metrics.
 */
export async function getAnalyticsExamCompletions(
    apiClient: ApiClientType,
    params?: GetAnalyticsParams,
): Promise<ExamCompletionMetric[]> {
    const query = buildQueryString(params);
    const response: ApiResponse<ExamCompletionMetric[]> = await apiClient(
        `/analytics/exam-completions${query}`,
    );
    return response.data;
}

/**
 * Fetches weekly incident trends over the last 5 weeks.
 *
 * @param apiClient The API client instance.
 * @param params Optional query parameters (institution_id).
 * @returns A promise resolving to an array of weekly incident trend metrics.
 */
export async function getAnalyticsIncidentTrends(
    apiClient: ApiClientType,
    params?: GetAnalyticsParams,
): Promise<IncidentTrendMetric[]> {
    const query = buildQueryString(params);
    const response: ApiResponse<IncidentTrendMetric[]> = await apiClient(
        `/analytics/incident-trends${query}`,
    );
    return response.data;
}

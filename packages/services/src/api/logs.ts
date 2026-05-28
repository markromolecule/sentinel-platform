import type { ApiClientType } from '../api-client';

/**
 * Parameters for querying logs.
 */
export interface LogQueryParams {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
    action?: string;
    resourceType?: string;
    userId?: string;
    branchId?: string;
}

/**
 * Structured log record representation.
 */
export interface LogRecord {
    logId: string;
    userId: string | null;
    action: string;
    resourceType: string | null;
    resourceId: string | null;
    details: any | null;
    ipAddress: string | null;
    createdAt: string;
    institutionId: string | null;
    branchId: string | null;
    userFirstName: string | null;
    userLastName: string | null;
}

/**
 * Paginated wrapper for log records.
 */
export interface LogPage {
    items: LogRecord[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

interface ApiResponse<T> {
    message: string;
    data: T;
}

/**
 * Helper to build the query string for logs endpoints.
 * Skips undefined, null, or empty string values.
 *
 * @param params Query parameters for filtering logs.
 * @returns Built query string (e.g. "?page=1&pageSize=10").
 */
export function buildLogsQueryString(params?: LogQueryParams): string {
    if (!params) {
        return '';
    }

    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === '') {
            continue;
        }
        searchParams.set(key, String(value));
    }

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

/**
 * Fetches authentication and session logs.
 *
 * @param apiClient The API client instance.
 * @param params Optional query filters and pagination.
 * @returns A promise resolving to the paginated log records.
 */
export async function getAuthLogs(
    apiClient: ApiClientType,
    params?: LogQueryParams,
): Promise<LogPage> {
    const query = buildLogsQueryString(params);
    const response: ApiResponse<LogPage> = await apiClient(`/logs/auth${query}`);
    return response.data;
}

/**
 * Fetches user operational activity logs.
 *
 * @param apiClient The API client instance.
 * @param params Optional query filters and pagination.
 * @returns A promise resolving to the paginated log records.
 */
export async function getActivityLogs(
    apiClient: ApiClientType,
    params?: LogQueryParams,
): Promise<LogPage> {
    const query = buildLogsQueryString(params);
    const response: ApiResponse<LogPage> = await apiClient(`/logs/activity${query}`);
    return response.data;
}

/**
 * Fetches backend system and cron logs.
 *
 * @param apiClient The API client instance.
 * @param params Optional query filters and pagination.
 * @returns A promise resolving to the paginated log records.
 */
export async function getSystemLogs(
    apiClient: ApiClientType,
    params?: LogQueryParams,
): Promise<LogPage> {
    const query = buildLogsQueryString(params);
    const response: ApiResponse<LogPage> = await apiClient(`/logs/system${query}`);
    return response.data;
}

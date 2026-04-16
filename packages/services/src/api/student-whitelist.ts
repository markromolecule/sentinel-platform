import type { ApiClientType } from '../api-client';
import {
    StudentWhitelistBulkImportInput,
    StudentWhitelistBulkImportResult,
    StudentWhitelist,
    StudentWhitelistInput,
    StudentWhitelistStatus,
} from '@sentinel/shared/types';

interface ApiStudentWhitelist {
    whitelist_id: string;
    institution_id: string;
    institution_name: string | null;
    department_id: string;
    department_name: string | null;
    department_code: string | null;
    course_id: string;
    course_title: string | null;
    course_code: string | null;
    student_number: string;
    last_name: string;
    first_name: string | null;
    status: StudentWhitelistStatus;
    claimed_user_id: string | null;
    claimed_at: string | null;
    claimed_email: string | null;
    claimed_name: string | null;
    created_at: string | null;
    updated_at: string | null;
}

interface ApiResponse<T> {
    message: string;
    data: T;
}

interface ApiStudentWhitelistBulkImportFailure {
    row_number: number;
    student_number: string | null;
    last_name: string | null;
    source_course: string | null;
    error: string;
}

interface ApiStudentWhitelistBulkImportResult {
    total_rows: number;
    created_count: number;
    failed_count: number;
    failures: ApiStudentWhitelistBulkImportFailure[];
}

interface ApiStudentWhitelistPurgeResult {
    deleted_count: number;
    skipped_claimed_count: number;
}

export interface GetStudentWhitelistParams {
    search?: string;
    institution_id?: string;
    department_id?: string;
    course_id?: string;
    status?: StudentWhitelistStatus;
}

export interface StudentWhitelistPurgeInput {
    institution_id?: string;
    department_id?: string;
    course_id?: string;
    status?: StudentWhitelistStatus;
    include_claimed?: boolean;
}

export interface StudentWhitelistPurgeResult {
    deletedCount: number;
    skippedClaimedCount: number;
}

function mapStudentWhitelistRecord(record: ApiStudentWhitelist): StudentWhitelist {
    return {
        id: record.whitelist_id,
        institutionId: record.institution_id,
        institutionName: record.institution_name,
        departmentId: record.department_id,
        departmentName: record.department_name,
        departmentCode: record.department_code,
        courseId: record.course_id,
        courseTitle: record.course_title,
        courseCode: record.course_code,
        studentNumber: record.student_number,
        lastName: record.last_name,
        firstName: record.first_name,
        status: record.status,
        claimedUserId: record.claimed_user_id,
        claimedAt: record.claimed_at,
        claimedEmail: record.claimed_email,
        claimedName: record.claimed_name,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
    };
}

function buildQuery(params: GetStudentWhitelistParams = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            searchParams.set(key, value);
        }
    });

    const query = searchParams.toString();
    return query ? `?${query}` : '';
}

function mapStudentWhitelistBulkImportResult(
    result: ApiStudentWhitelistBulkImportResult,
): StudentWhitelistBulkImportResult {
    return {
        totalRows: result.total_rows,
        createdCount: result.created_count,
        failedCount: result.failed_count,
        failures: result.failures.map((failure) => ({
            rowNumber: failure.row_number,
            studentNumber: failure.student_number,
            lastName: failure.last_name,
            sourceCourse: failure.source_course,
            error: failure.error,
        })),
    };
}

function mapStudentWhitelistPurgeResult(
    result: ApiStudentWhitelistPurgeResult,
): StudentWhitelistPurgeResult {
    return {
        deletedCount: result.deleted_count,
        skippedClaimedCount: result.skipped_claimed_count,
    };
}

export async function getStudentWhitelist(
    apiClient: ApiClientType,
    params: GetStudentWhitelistParams = {},
): Promise<StudentWhitelist[]> {
    const response: ApiResponse<ApiStudentWhitelist[]> = await apiClient(
        `/student-whitelist${buildQuery(params)}`,
    );

    return response.data.map(mapStudentWhitelistRecord);
}

export async function createStudentWhitelist(
    apiClient: ApiClientType,
    payload: StudentWhitelistInput,
): Promise<StudentWhitelist> {
    const response: ApiResponse<ApiStudentWhitelist> = await apiClient('/student-whitelist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return mapStudentWhitelistRecord(response.data);
}

export async function updateStudentWhitelist(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: Partial<StudentWhitelistInput>;
    },
): Promise<StudentWhitelist> {
    const response: ApiResponse<ApiStudentWhitelist> = await apiClient(`/student-whitelist/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return mapStudentWhitelistRecord(response.data);
}

export async function bulkImportStudentWhitelist(
    apiClient: ApiClientType,
    payload: StudentWhitelistBulkImportInput,
): Promise<StudentWhitelistBulkImportResult> {
    const response: ApiResponse<ApiStudentWhitelistBulkImportResult> = await apiClient(
        '/student-whitelist/bulk',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );

    return mapStudentWhitelistBulkImportResult(response.data);
}

export async function deleteStudentWhitelist(apiClient: ApiClientType, id: string): Promise<void> {
    await apiClient(`/student-whitelist/${id}`, {
        method: 'DELETE',
    });
}

export async function purgeStudentWhitelist(
    apiClient: ApiClientType,
    payload: StudentWhitelistPurgeInput,
): Promise<StudentWhitelistPurgeResult> {
    const response: ApiResponse<ApiStudentWhitelistPurgeResult> = await apiClient(
        '/student-whitelist/purge',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );

    return mapStudentWhitelistPurgeResult(response.data);
}

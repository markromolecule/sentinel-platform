import type {
    MasterSubject,
    EnrolledSubjectData,
    EnrollmentRequest,
    SubjectClassificationSummary,
    StudentClassroom,
    SubjectFormValues,
    InstructorSubjectRequestValues,
    UpdateEnrollmentRequestValues,
} from '@sentinel/shared';
import type { ApiClientType } from '../api-client';
import type { ApiResponse } from '../types';
import type { PaginatedApiResponse } from './pagination';

interface ApiSubject {
    subject_id: string;
    subject_code: string;
    subject_title: string;
    term_id: string | null;
    is_opened: boolean | null;
    offering_start_date: string | null;
    offering_end_date: string | null;
    department_ids: string[];
    course_ids: string[];
    section_ids: string[];
    year_levels: number[];
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    source_record_id?: string | null;
    inheritance_status?: string;
    origin_institution_id?: string | null;
    effective_institution_id?: string | null;
    is_local?: boolean;
    is_inherited?: boolean;
    is_overridden?: boolean;
    is_hidden?: boolean;
    institution_name?: string | null;
    classifications: Array<{
        id: string;
        name: string;
        type: SubjectClassificationSummary['type'];
    }>;
}

type EnrollInstructorSubjectResult = {
    classGroupIds: string[];
    requestedDepartmentIds: string[];
    requestedCourseIds: string[];
    requestedYearLevels: number[];
    resolvedSectionIds: string[];
    resolvedSectionCount: number;
    newRequestsCount: number;
    existingRequestsCount: number;
    existingRolesCount: number;
    skippedCount: number;
    total: number;
};

type DeleteAllSubjectsResult = {
    deleted_count: number;
};

type DeleteEnrollmentRequestsResult = {
    deleted_count: number;
};

type UpdateEnrollmentRequestResult = {
    request_ids: string[];
    class_group_ids: string[];
    status: 'PENDING';
    resolved_section_ids: string[];
    resolved_section_count: number;
};

function mapSubject(apiSubject: ApiSubject): MasterSubject {
    return {
        id: apiSubject.subject_id,
        code: apiSubject.subject_code,
        title: apiSubject.subject_title,
        termId: apiSubject.term_id,
        isOpened: apiSubject.is_opened ?? false,
        offeringStartDate: apiSubject.offering_start_date,
        offeringEndDate: apiSubject.offering_end_date,
        departmentIds: apiSubject.department_ids ?? [],
        courseIds: apiSubject.course_ids ?? [],
        sectionIds: apiSubject.section_ids ?? [],
        yearLevels: apiSubject.year_levels ?? [],
        createdAt: apiSubject.created_at,
        createdBy: apiSubject.created_by,
        updatedAt: apiSubject.updated_at,
        updatedBy: apiSubject.updated_by,
        classifications: apiSubject.classifications ?? [],
        sourceRecordId: apiSubject.source_record_id ?? null,
        inheritanceStatus: apiSubject.inheritance_status,
        originInstitutionId: apiSubject.origin_institution_id ?? null,
        effectiveInstitutionId: apiSubject.effective_institution_id ?? null,
        isLocal: apiSubject.is_local,
        isInherited: apiSubject.is_inherited,
        isOverridden: apiSubject.is_overridden,
        isHidden: apiSubject.is_hidden,
        institutionName: apiSubject.institution_name,
    };
}

export async function getSubjects(
    apiClient: ApiClientType,
    params: {
        search?: string;
        institutionId?: string;
        page?: number;
        limit?: number;
    } = {},
): Promise<PaginatedApiResponse<MasterSubject>> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.institutionId) queryParams.append('institutionId', params.institutionId);
    if (params.page !== undefined) queryParams.append('page', String(params.page));
    if (params.limit !== undefined) queryParams.append('limit', String(params.limit));

    const queryString = queryParams.toString();
    const url = queryString ? `/subjects?${queryString}` : '/subjects';
    const response: ApiResponse<ApiSubject[]> = await apiClient(url);
    return {
        items: response.data.map(mapSubject),
        pagination: response.pagination,
    };
}

export async function createSubject(
    apiClient: ApiClientType,
    payload: SubjectFormValues,
): Promise<MasterSubject> {
    const response: ApiResponse<ApiSubject> = await apiClient('/subjects', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return mapSubject(response.data);
}

export async function updateSubject(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: Partial<SubjectFormValues>;
    },
): Promise<MasterSubject> {
    const response: ApiResponse<ApiSubject> = await apiClient(`/subjects/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return mapSubject(response.data);
}

export async function deleteSubject(
    apiClient: ApiClientType,
    id: string,
    institutionId?: string,
): Promise<void> {
    const url = institutionId
        ? `/subjects/${id}?institutionId=${encodeURIComponent(institutionId)}`
        : `/subjects/${id}`;

    await apiClient(url, {
        method: 'DELETE',
    });
}

export async function deleteSelectedSubjects(
    apiClient: ApiClientType,
    subjectIds: string[],
): Promise<number> {
    const response: ApiResponse<DeleteAllSubjectsResult> = await apiClient('/subjects/bulk', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject_ids: subjectIds }),
    });

    return response.data.deleted_count;
}

export async function getEnrolledSubjects(
    apiClient: ApiClientType,
    search?: string,
): Promise<EnrolledSubjectData[]>;
export async function getEnrolledSubjects(
    apiClient: ApiClientType,
    params: {
        search?: string;
        page?: number;
        limit?: number;
    },
): Promise<PaginatedApiResponse<EnrolledSubjectData>>;
export async function getEnrolledSubjects(
    apiClient: ApiClientType,
    searchOrParams?: string | { search?: string; page?: number; limit?: number },
): Promise<EnrolledSubjectData[] | PaginatedApiResponse<EnrolledSubjectData>> {
    const params =
        typeof searchOrParams === 'string' ? { search: searchOrParams } : (searchOrParams ?? {});
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.page !== undefined) queryParams.append('page', String(params.page));
    if (params.limit !== undefined) queryParams.append('limit', String(params.limit));

    const queryString = queryParams.toString();
    const url = queryString ? `/enrollments/enrolled?${queryString}` : '/enrollments/enrolled';
    const response: ApiResponse<EnrolledSubjectData[]> = await apiClient(url);
    const items = response.data;
    return response.pagination ? { items, pagination: response.pagination } : items;
}

export async function enrollInstructorSubject(
    apiClient: ApiClientType,
    payload: InstructorSubjectRequestValues,
): Promise<ApiResponse<EnrollInstructorSubjectResult>> {
    const response: ApiResponse<EnrollInstructorSubjectResult> = await apiClient(
        '/enrollments/enroll',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );

    return response;
}

export async function getEnrollmentRequests(
    apiClient: ApiClientType,
    status?: 'PENDING' | 'APPROVED' | 'REJECTED',
    search?: string,
    institutionId?: string,
): Promise<EnrollmentRequest[]>;
export async function getEnrollmentRequests(
    apiClient: ApiClientType,
    params: {
        status?: 'PENDING' | 'APPROVED' | 'REJECTED';
        search?: string;
        institutionId?: string;
        page?: number;
        limit?: number;
    },
): Promise<PaginatedApiResponse<EnrollmentRequest>>;
export async function getEnrollmentRequests(
    apiClient: ApiClientType,
    statusOrParams?:
        | 'PENDING'
        | 'APPROVED'
        | 'REJECTED'
        | {
              status?: 'PENDING' | 'APPROVED' | 'REJECTED';
              search?: string;
              institutionId?: string;
              page?: number;
              limit?: number;
          },
    search?: string,
    institutionId?: string,
): Promise<EnrollmentRequest[] | PaginatedApiResponse<EnrollmentRequest>> {
    const params =
        typeof statusOrParams === 'string' || statusOrParams === undefined
            ? { status: statusOrParams, search, institutionId }
            : (statusOrParams ?? {});
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.institutionId) queryParams.append('institutionId', params.institutionId);
    if (params.page !== undefined) queryParams.append('page', String(params.page));
    if (params.limit !== undefined) queryParams.append('limit', String(params.limit));

    const queryString = queryParams.toString();
    const url = queryString ? `/enrollments/requests?${queryString}` : '/enrollments/requests';
    const response: ApiResponse<EnrollmentRequest[]> = await apiClient(url);
    const items = response.data;
    return response.pagination ? { items, pagination: response.pagination } : items;
}

export async function approveEnrollmentRequest(
    apiClient: ApiClientType,
    requestIds: string[],
): Promise<{ class_group_id: string; user_id: string }[]> {
    const response: ApiResponse<{ class_group_id: string; user_id: string }[]> = await apiClient(
        '/enrollments/requests/approve',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ request_ids: requestIds }),
        },
    );
    return response.data;
}

export async function rejectEnrollmentRequest(
    apiClient: ApiClientType,
    requestIds: string[],
): Promise<string[]> {
    const response: ApiResponse<string[]> = await apiClient('/enrollments/requests/reject', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_ids: requestIds }),
    });

    return response.data;
}

export async function unapproveEnrollmentRequest(
    apiClient: ApiClientType,
    requestIds: string[],
): Promise<string[]> {
    const response: ApiResponse<string[]> = await apiClient('/enrollments/requests/unapprove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_ids: requestIds }),
    });

    return response.data;
}

export async function deleteEnrollmentRequests(
    apiClient: ApiClientType,
    requestIds: string[],
): Promise<number> {
    const response: ApiResponse<DeleteEnrollmentRequestsResult> = await apiClient(
        '/enrollments/requests/bulk',
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ request_ids: requestIds }),
        },
    );

    return response.data.deleted_count;
}

export async function updateEnrollmentRequest(
    apiClient: ApiClientType,
    payload: UpdateEnrollmentRequestValues,
): Promise<ApiResponse<UpdateEnrollmentRequestResult>> {
    const response: ApiResponse<UpdateEnrollmentRequestResult> = await apiClient(
        '/enrollments/requests',
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        },
    );

    return response;
}

export const unenrollInstructorSubject = async (
    apiClient: ApiClientType,
    id: string,
    status?: string,
    classGroupIds?: string[],
): Promise<void> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (classGroupIds && classGroupIds.length > 0) {
        classGroupIds.forEach((sid) => params.append('class_group_ids', sid));
    }

    const queryString = params.toString();
    const url = queryString
        ? `/enrollments/${id}/unenroll?${queryString}`
        : `/enrollments/${id}/unenroll`;

    await apiClient(url, {
        method: 'DELETE',
    });
};

export async function getStudentClassrooms(apiClient: ApiClientType): Promise<StudentClassroom[]> {
    const response: ApiResponse<StudentClassroom[]> = await apiClient(
        '/enrollments/student/classrooms',
    );
    return response.data;
}

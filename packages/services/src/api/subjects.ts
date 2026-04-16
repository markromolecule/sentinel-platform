import type { SubjectFormValues, InstructorSubjectRequestValues } from '@sentinel/shared/schema';
import type {
    MasterSubject,
    EnrolledSubjectData,
    EnrollmentRequest,
    SubjectClassificationSummary,
} from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';

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
    classifications: Array<{
        id: string;
        name: string;
        type: SubjectClassificationSummary['type'];
    }>;
}

interface ApiResponse<T> {
    message: string;
    data: T;
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
    };
}

export async function getSubjects(
    apiClient: ApiClientType,
    search?: string,
): Promise<MasterSubject[]> {
    const url = search ? `/subjects?search=${encodeURIComponent(search)}` : '/subjects';
    const response: ApiResponse<ApiSubject[]> = await apiClient(url);
    return response.data.map(mapSubject);
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

export async function deleteSubject(apiClient: ApiClientType, id: string): Promise<void> {
    await apiClient(`/subjects/${id}`, {
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
): Promise<EnrolledSubjectData[]> {
    const url = search
        ? `/enrollments/enrolled?search=${encodeURIComponent(search)}`
        : '/enrollments/enrolled';
    const response: ApiResponse<EnrolledSubjectData[]> = await apiClient(url);
    return response.data;
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
): Promise<EnrollmentRequest[]> {
    const url = status ? `/enrollments/requests?status=${status}` : '/enrollments/requests';
    const response: ApiResponse<EnrollmentRequest[]> = await apiClient(url);
    return response.data;
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

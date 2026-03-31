import type {
    SubjectOfferingFormValues,
    SubjectOfferingUpdateFormValues,
} from '@sentinel/shared/schema';
import type { SubjectOffering } from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';

interface ApiSubjectOffering {
    subject_offering_id: string;
    subject_id: string;
    subject_code: string;
    subject_title: string;
    term_id: string;
    term_academic_year: string;
    term_semester: string;
    term_start_date: string | null;
    term_end_date: string | null;
    status: SubjectOffering['status'];
    department_ids: string[];
    course_ids: string[];
    section_ids: string[];
    year_levels: number[];
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
}

interface ApiResponse<T> {
    message: string;
    data: T;
}

type SubjectOfferingQueryParams = {
    search?: string;
    subjectId?: string;
    termId?: string;
};

function mapSubjectOffering(apiSubjectOffering: ApiSubjectOffering): SubjectOffering {
    return {
        id: apiSubjectOffering.subject_offering_id,
        subjectId: apiSubjectOffering.subject_id,
        subjectCode: apiSubjectOffering.subject_code,
        subjectTitle: apiSubjectOffering.subject_title,
        termId: apiSubjectOffering.term_id,
        termAcademicYear: apiSubjectOffering.term_academic_year,
        termSemester: apiSubjectOffering.term_semester,
        termStartDate: apiSubjectOffering.term_start_date,
        termEndDate: apiSubjectOffering.term_end_date,
        status: apiSubjectOffering.status,
        departmentIds: apiSubjectOffering.department_ids ?? [],
        courseIds: apiSubjectOffering.course_ids ?? [],
        sectionIds: apiSubjectOffering.section_ids ?? [],
        yearLevels: apiSubjectOffering.year_levels ?? [],
        createdAt: apiSubjectOffering.created_at,
        createdBy: apiSubjectOffering.created_by,
        updatedAt: apiSubjectOffering.updated_at,
        updatedBy: apiSubjectOffering.updated_by,
    };
}

function buildQueryString(params?: SubjectOfferingQueryParams) {
    if (!params) {
        return '';
    }

    const searchParams = new URLSearchParams();

    if (params.search) {
        searchParams.set('search', params.search);
    }

    if (params.subjectId) {
        searchParams.set('subject_id', params.subjectId);
    }

    if (params.termId) {
        searchParams.set('term_id', params.termId);
    }

    const query = searchParams.toString();
    return query ? `?${query}` : '';
}

export async function getSubjectOfferings(
    apiClient: ApiClientType,
    params?: SubjectOfferingQueryParams,
): Promise<SubjectOffering[]> {
    const response: ApiResponse<ApiSubjectOffering[]> = await apiClient(
        `/subject-offerings${buildQueryString(params)}`,
    );

    return response.data.map(mapSubjectOffering);
}

export async function createSubjectOffering(
    apiClient: ApiClientType,
    payload: SubjectOfferingFormValues,
): Promise<SubjectOffering> {
    const response: ApiResponse<ApiSubjectOffering> = await apiClient('/subject-offerings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return mapSubjectOffering(response.data);
}

export async function updateSubjectOffering(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: SubjectOfferingUpdateFormValues;
    },
): Promise<SubjectOffering> {
    const response: ApiResponse<ApiSubjectOffering> = await apiClient(`/subject-offerings/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return mapSubjectOffering(response.data);
}

import { Semester, SemesterInput, ApiResponse } from '@sentinel/shared/types';
import type { ApiClientType } from '../api-client';

// Backend returns snake_case format
interface ApiSemester {
    term_id: string;
    academic_year: string;
    semester: string;
    is_active: boolean | null;
    start_date: string | null;
    end_date: string | null;
    created_at: string | null;
    updated_at: string | null;
    institution_name: string | null;
    institution_id: string | null;
}

// map the api response to the semester type
function mapSemester(apiSem: ApiSemester): Semester {
    return {
        id: apiSem.term_id,
        academicYear: apiSem.academic_year,
        semester: apiSem.semester,
        isActive: apiSem.is_active ?? false,
        startDate: apiSem.start_date,
        endDate: apiSem.end_date,
        institution: apiSem.institution_name,
        institutionId: apiSem.institution_id,
        createdAt: apiSem.created_at || new Date().toISOString(),
        updatedAt: apiSem.updated_at,
    };
}

// get all semesters
export async function getSemesters(
    apiClient: ApiClientType,
    search?: string,
    institutionId?: string,
): Promise<Semester[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (institutionId) params.append('institutionId', institutionId);

    const queryString = params.toString();
    const url = queryString ? `/semesters?${queryString}` : '/semesters';

    const response: ApiResponse<ApiSemester[]> = await apiClient(url);
    return response.data?.map(mapSemester) || [];
}

// create a semester
export async function createSemester(
    apiClient: ApiClientType,
    payload: SemesterInput,
): Promise<Semester> {
    const response: ApiResponse<ApiSemester> = await apiClient('/semesters', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.data) throw new Error('Failed to create semester');
    return mapSemester(response.data);
}

// update a semester
export async function updateSemester(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: Partial<SemesterInput>;
    },
): Promise<Semester> {
    const response: ApiResponse<ApiSemester> = await apiClient(`/semesters/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.data) throw new Error('Failed to update semester');
    return mapSemester(response.data);
}

// delete a semester
export async function deleteSemester(apiClient: ApiClientType, id: string): Promise<void> {
    await apiClient(`/semesters/${id}`, {
        method: 'DELETE',
    });
}

// delete multiple semesters
export async function deleteSemesters(apiClient: ApiClientType, ids: string[]): Promise<void> {
    await apiClient('/semesters/bulk-delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
    });
}

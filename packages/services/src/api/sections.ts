import { Section } from '@sentinel/shared/types';
import { SectionFormValues } from '@sentinel/shared/schema';
import type { ApiClientType } from '../api-client';

// Backend returns snake_case format
interface ApiSection {
    section_id: string;
    section_name: string;
    department_id: string | null;
    course_id: string | null;
    year_level: number | null;
    created_at: string | null;
    updated_at: string | null;
    created_by: string | null;
    updated_by: string | null;
    institution_id?: string | null;
    source_record_id?: string | null;
    inheritance_status?: string;
    origin_institution_id?: string | null;
    effective_institution_id?: string | null;
    is_local?: boolean;
    is_inherited?: boolean;
    is_overridden?: boolean;
    is_hidden?: boolean;
}

// api response interface
interface ApiResponse<T> {
    message: string;
    data: T;
}

// map the api response to the Section type
function mapSection(apiSec: ApiSection): Section {
    return {
        id: apiSec.section_id,
        name: apiSec.section_name,
        departmentId: apiSec.department_id ?? null,
        courseId: apiSec.course_id ?? null,
        yearLevel: apiSec.year_level ?? undefined,
        institutionId: apiSec.institution_id ?? null,
        createdAt: apiSec.created_at,
        updatedAt: apiSec.updated_at,
        createdBy: apiSec.created_by ?? undefined,
        updatedBy: apiSec.updated_by ?? undefined,
        sourceRecordId: apiSec.source_record_id ?? null,
        inheritanceStatus: apiSec.inheritance_status,
        originInstitutionId: apiSec.origin_institution_id ?? null,
        effectiveInstitutionId: apiSec.effective_institution_id ?? null,
        isLocal: apiSec.is_local,
        isInherited: apiSec.is_inherited,
        isOverridden: apiSec.is_overridden,
        isHidden: apiSec.is_hidden,
    };
}

// get all sections
export async function getSections(
    apiClient: ApiClientType,
    search?: string,
    institutionId?: string,
    courseId?: string,
): Promise<Section[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (institutionId) params.append('institutionId', institutionId);
    if (courseId) params.append('courseId', courseId);

    const queryString = params.toString();
    const url = queryString ? `/sections?${queryString}` : '/sections';

    const response: ApiResponse<ApiSection[]> = await apiClient(url);
    return response.data.map(mapSection);
}

// create a section
export async function createSection(
    apiClient: ApiClientType,
    payload: SectionFormValues,
): Promise<Section> {
    const response: ApiResponse<ApiSection> = await apiClient('/sections', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return mapSection(response.data);
}

// update a section
export async function updateSection(
    apiClient: ApiClientType,
    {
        id,
        payload,
    }: {
        id: string;
        payload: Partial<SectionFormValues>;
    },
): Promise<Section> {
    const response: ApiResponse<ApiSection> = await apiClient(`/sections/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return mapSection(response.data);
}

// delete a section
export async function deleteSection(
    apiClient: ApiClientType,
    id: string,
    institutionId?: string,
): Promise<void> {
    const url = institutionId
        ? `/sections/${id}?institutionId=${encodeURIComponent(institutionId)}`
        : `/sections/${id}`;

    await apiClient(url, {
        method: 'DELETE',
    });
}

export async function deleteSections(apiClient: ApiClientType, ids: string[]): Promise<void> {
    await apiClient('/sections/bulk-delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
    });
}

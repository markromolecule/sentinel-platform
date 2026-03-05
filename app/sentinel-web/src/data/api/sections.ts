import { Section } from '@sentinel/shared/types';
import { SectionFormValues } from '@sentinel/shared/schema';
import { apiClient } from './client';

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
        createdAt: apiSec.created_at,
        updatedAt: apiSec.updated_at,
        createdBy: apiSec.created_by ?? undefined,
        updatedBy: apiSec.updated_by ?? undefined,
    };
}

// get all sections
export async function getSections(): Promise<Section[]> {
    const response: ApiResponse<ApiSection[]> = await apiClient('/sections');
    return response.data.map(mapSection);
}

// create a section
export async function createSection(payload: SectionFormValues): Promise<Section> {
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
export async function updateSection({
    id,
    payload,
}: {
    id: string;
    payload: Partial<SectionFormValues>;
}): Promise<Section> {
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
export async function deleteSection(id: string): Promise<void> {
    await apiClient(`/sections/${id}`, {
        method: 'DELETE',
    });
}

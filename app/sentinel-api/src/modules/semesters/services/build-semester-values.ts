import { type DB } from '@sentinel/db';
import { type CreateSemesterBody, type UpdateSemesterBody } from '../semesters.dto';
import { type Insertable, type Updateable } from 'kysely';

export function buildCreateSemesterValues(
    data: CreateSemesterBody,
    institutionId: string,
    supportsUpdatedAt: boolean,
): Insertable<DB['terms']> {
    return {
        academic_year: data.academic_year,
        semester: data.semester,
        is_active: data.is_active ?? false,
        start_date: data.start_date ? new Date(data.start_date) : null,
        end_date: data.end_date ? new Date(data.end_date) : null,
        institution_id: institutionId,
        created_at: new Date(),
        ...(supportsUpdatedAt ? { updated_at: new Date() } : {}),
    };
}

export function buildUpdateSemesterValues(
    data: UpdateSemesterBody,
    institutionId: string | null | undefined,
    supportsUpdatedAt: boolean,
): Updateable<DB['terms']> {
    return {
        ...(data.academic_year !== undefined ? { academic_year: data.academic_year } : {}),
        ...(data.semester !== undefined ? { semester: data.semester } : {}),
        ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
        ...(data.start_date !== undefined
            ? { start_date: data.start_date ? new Date(data.start_date) : null }
            : {}),
        ...(data.end_date !== undefined
            ? { end_date: data.end_date ? new Date(data.end_date) : null }
            : {}),
        ...(institutionId !== undefined ? { institution_id: institutionId } : {}),
        ...(supportsUpdatedAt ? { updated_at: new Date() } : {}),
    };
}

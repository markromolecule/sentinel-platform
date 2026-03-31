import { getSemestersData } from './data/get-semesters';
import { createSemesterData } from './data/create-semester';
import { updateSemesterData } from './data/update-semester';
import { deleteSemesterData } from './data/delete-semester';
import { type DbClient } from '@sentinel/db';
import { type CreateSemesterBody, type UpdateSemesterBody } from './semesters.dto';
import { HTTPException } from 'hono/http-exception';

export class SemesterService {
    static async getSemesters(dbClient: DbClient, institutionId?: string, search?: string) {
        const rawSemesters = await getSemestersData({ dbClient, institutionId, search });

        return rawSemesters.map((semester: any) => ({
            term_id: semester.term_id,
            academic_year: semester.academic_year,
            semester: semester.semester,
            is_active: semester.is_active,
            start_date: semester.start_date,
            end_date: semester.end_date,
            created_at: semester.created_at,
            institution_id: semester.institution_id,
        }));
    }

    static async createSemester(
        dbClient: DbClient,
        data: CreateSemesterBody,
        createdBy: string,
        institutionId?: string,
    ) {
        const targetInstitutionId = data.institution_id || institutionId;

        if (!targetInstitutionId) {
            throw new HTTPException(403, {
                message: 'Institution ID is required to create a semester.',
            });
        }

        try {
            // If the new semester is active, deactivate others for this institution
            if (data.is_active) {
                await dbClient
                    .updateTable('terms')
                    .set({ is_active: false })
                    .where('institution_id', '=', targetInstitutionId)
                    .execute();
            }

            return await createSemesterData({
                dbClient,
                values: {
                    academic_year: data.academic_year,
                    semester: data.semester,
                    is_active: data.is_active ?? false,
                    start_date: data.start_date ? new Date(data.start_date) : null,
                    end_date: data.end_date ? new Date(data.end_date) : null,
                    institution_id: targetInstitutionId,
                    created_at: new Date(),
                },
            });
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            if (code === 'P2002' || code === '23505') {
                throw new HTTPException(409, { message: 'Semester already exists for this academic year and institution.' });
            }
            throw error;
        }
    }

    static async updateSemester(
        dbClient: DbClient,
        id: string,
        data: UpdateSemesterBody,
        updatedBy: string,
        institutionId?: string,
    ) {
        try {
            // Find current record to get institution_id if not provided
            const current = await dbClient
                .selectFrom('terms')
                .select(['institution_id', 'is_active'])
                .where('term_id', '=', id)
                .executeTakeFirstOrThrow();

            const targetInstitutionId = institutionId || current.institution_id;

            // If updating to active, deactivate others
            if (data.is_active === true && !current.is_active) {
                await dbClient
                    .updateTable('terms')
                    .set({ is_active: false })
                    .where('institution_id', '=', targetInstitutionId)
                    .execute();
            }

            const rawSemester = await updateSemesterData({
                dbClient,
                id,
                values: {
                    ...(data.academic_year !== undefined ? { academic_year: data.academic_year } : {}),
                    ...(data.semester !== undefined ? { semester: data.semester } : {}),
                    ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
                    ...(data.start_date !== undefined ? { start_date: data.start_date ? new Date(data.start_date) : null } : {}),
                    ...(data.end_date !== undefined ? { end_date: data.end_date ? new Date(data.end_date) : null } : {}),
                },
                institutionId: targetInstitutionId || undefined,
            });

            return {
                term_id: rawSemester.term_id,
                academic_year: rawSemester.academic_year,
                semester: rawSemester.semester,
                is_active: rawSemester.is_active,
                start_date: rawSemester.start_date,
                end_date: rawSemester.end_date,
                created_at: rawSemester.created_at,
                institution_id: rawSemester.institution_id,
            };
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            if (code === 'P2002' || code === '23505') {
                throw new HTTPException(409, { message: 'Semester already exists.' });
            }
            if (error.name === 'NotFoundError') {
                throw new HTTPException(404, { message: 'Semester not found.' });
            }
            throw error;
        }
    }

    static async deleteSemester(
        dbClient: DbClient,
        id: string,
        deletedBy: string,
        institutionId?: string,
    ) {
        try {
            return await deleteSemesterData({ dbClient, id, institutionId });
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            if (code === 'P2003' || code === '23503') {
                throw new HTTPException(409, {
                    message: 'Cannot delete semester because it is being used by class groups.',
                });
            }
            if (error.name === 'NotFoundError') {
                throw new HTTPException(404, { message: 'Semester not found.' });
            }
            throw error;
        }
    }
}

import { getSemestersData } from './data/get-semesters';
import { createSemesterData } from './data/create-semester';
import { updateSemesterData } from './data/update-semester';
import { deleteSemesterData } from './data/delete-semester';
import { deleteSemestersData } from './data/delete-semesters';
import { deactivateInstitutionSemestersData } from './data/deactivate-institution-semesters';
import { getInstitutionNameData } from './data/get-institution-name';
import { getSemesterStateData } from './data/get-semester-state';
import { hasTermsUpdatedAtColumnData } from './data/has-terms-updated-at-column';
import { type DbClient } from '@sentinel/db';
import { type CreateSemesterBody, type UpdateSemesterBody } from './semesters.dto';
import { HTTPException } from 'hono/http-exception';
import {
    buildCreateSemesterValues,
    buildUpdateSemesterValues,
} from './services/build-semester-values';
import { mapSemesterResponse } from './services/map-semester-response';

export class SemesterService {
    static async getSemesters(dbClient: DbClient, institutionId?: string, search?: string) {
        const rawSemesters = await getSemestersData({ dbClient, institutionId, search });
        return rawSemesters.map(mapSemesterResponse);
    }

    static async createSemester(
        dbClient: DbClient,
        data: CreateSemesterBody,
        institutionId?: string,
    ) {
        const targetInstitutionId = institutionId ?? data.institution_id;

        if (!targetInstitutionId) {
            throw new HTTPException(403, {
                message: 'Institution ID is required to create a semester.',
            });
        }

        try {
            const hasUpdatedAtColumn = await hasTermsUpdatedAtColumnData({ dbClient });

            if (data.is_active) {
                await deactivateInstitutionSemestersData({
                    dbClient,
                    institutionId: targetInstitutionId,
                });
            }

            const rawSemester = await createSemesterData({
                dbClient,
                values: buildCreateSemesterValues(data, targetInstitutionId, hasUpdatedAtColumn),
            });

            const institutionName = await getInstitutionNameData({
                dbClient,
                institutionId: rawSemester.institution_id,
            });

            return mapSemesterResponse({
                ...rawSemester,
                institution_name: institutionName,
            });
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message || '';

            if (
                code === 'P2002' ||
                code === '23505' ||
                (code === 'P2010' && message.includes('23505'))
            ) {
                throw new HTTPException(409, {
                    message: 'Semester already exists for this academic year and institution.',
                });
            }
            throw error;
        }
    }

    static async updateSemester(
        dbClient: DbClient,
        id: string,
        data: UpdateSemesterBody,
        institutionId?: string,
    ) {
        try {
            const hasUpdatedAtColumn = await hasTermsUpdatedAtColumnData({ dbClient });

            const current = await getSemesterStateData({ dbClient, id, institutionId });

            const currentScopeInstitutionId = institutionId || current.institution_id || undefined;
            const targetInstitutionId =
                institutionId ?? data.institution_id ?? current.institution_id;

            const shouldDeactivateOtherTerms =
                Boolean(targetInstitutionId) &&
                ((data.is_active === true && !current.is_active) ||
                    (current.is_active && targetInstitutionId !== current.institution_id));

            if (shouldDeactivateOtherTerms && targetInstitutionId) {
                await deactivateInstitutionSemestersData({
                    dbClient,
                    institutionId: targetInstitutionId,
                    excludeTermId: id,
                });
            }

            const rawSemester = await updateSemesterData({
                dbClient,
                id,
                values: buildUpdateSemesterValues(data, targetInstitutionId, hasUpdatedAtColumn),
                institutionId: currentScopeInstitutionId,
            });

            const institutionName = await getInstitutionNameData({
                dbClient,
                institutionId: rawSemester.institution_id,
            });

            return mapSemesterResponse({
                ...rawSemester,
                institution_name: institutionName,
            });
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message || '';

            if (
                code === 'P2002' ||
                code === '23505' ||
                (code === 'P2010' && message.includes('23505'))
            ) {
                throw new HTTPException(409, { message: 'Semester already exists.' });
            }
            if (error.name === 'NotFoundError') {
                throw new HTTPException(404, { message: 'Semester not found.' });
            }
            throw error;
        }
    }

    static async deleteSemester(dbClient: DbClient, id: string, institutionId?: string) {
        try {
            return await deleteSemesterData({ dbClient, id, institutionId });
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message ?? '';
            if (
                code === 'P2003' ||
                code === '23503' ||
                (code === 'P2010' && message.includes('23503'))
            ) {
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

    static async deleteSemesters(dbClient: DbClient, ids: string[], institutionId?: string) {
        try {
            return await deleteSemestersData({ dbClient, ids, institutionId });
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message ?? '';
            if (
                code === 'P2003' ||
                code === '23503' ||
                (code === 'P2010' && message.includes('23503'))
            ) {
                throw new HTTPException(409, {
                    message:
                        'Cannot delete one or more semesters because they are currently in use.',
                });
            }
            throw error;
        }
    }
}

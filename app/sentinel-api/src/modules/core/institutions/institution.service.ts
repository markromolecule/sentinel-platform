import { getInstitutionsData } from './data/get-institutions';
import { createInstitutionData } from './data/create-institution';
import { updateInstitutionData } from './data/update-institution';
import { deleteInstitutionData } from './data/delete-institution';
import { getInstitutionByIdData } from './data/get-institution-by-id';
import { type DbClient } from '@sentinel/db';
import { type CreateInstitutionBody, type UpdateInstitutionBody } from './institution.dto';
import { HTTPException } from 'hono/http-exception';

export class InstitutionService {
    private static formatInstitution(inst: any) {
        return {
            id: inst.institution_id,
            name: inst.name,
            code: inst.code,
            createdAt: inst.created_at,
            createdBy: inst.creator_first_name
                ? `${inst.creator_first_name} ${inst.creator_last_name}`
                : inst.created_by,
            updatedAt: inst.updated_at,
            updatedBy: inst.updater_first_name
                ? `${inst.updater_first_name} ${inst.updater_last_name}`
                : inst.updated_by,
        };
    }

    static async getInstitutions(dbClient: DbClient, search?: string) {
        const rawInstitutions = await getInstitutionsData({ dbClient, search });
        return rawInstitutions.map((inst: any) => this.formatInstitution(inst));
    }

    static async createInstitution(
        dbClient: DbClient,
        data: CreateInstitutionBody,
        createdBy: string,
    ) {
        try {
            const rawInstitution = await createInstitutionData({
                dbClient,
                values: {
                    name: data.name,
                    code: data.code,
                    created_by: createdBy,
                },
            });

            // Fetch full record with names
            const fullInstitution = await getInstitutionByIdData({
                dbClient,
                id: rawInstitution.id,
            });

            if (!fullInstitution) {
                throw new HTTPException(500, { message: 'Failed to retrieve created institution' });
            }

            return this.formatInstitution(fullInstitution);
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message || '';

            if (
                code === 'P2002' ||
                code === '23505' ||
                (code === 'P2010' && message.includes('23505'))
            ) {
                throw new HTTPException(409, {
                    message: 'Institution already exists with this name.',
                });
            }
            throw error;
        }
    }

    static async updateInstitution(
        dbClient: DbClient,
        id: string,
        data: UpdateInstitutionBody,
        updatedBy: string,
    ) {
        try {
            await updateInstitutionData({
                dbClient,
                id,
                values: {
                    ...(data.name !== undefined ? { name: data.name } : {}),
                    ...(data.code !== undefined ? { code: data.code } : {}),
                    updated_by: updatedBy,
                    updated_at: new Date().toISOString(),
                },
            });

            // Fetch full record with names
            const fullInstitution = await getInstitutionByIdData({
                dbClient,
                id,
            });

            if (!fullInstitution) {
                throw new HTTPException(404, { message: 'Institution not found after update' });
            }

            return this.formatInstitution(fullInstitution);
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            const message = error?.message || '';

            if (
                code === 'P2002' ||
                code === '23505' ||
                (code === 'P2010' && message.includes('23505'))
            ) {
                throw new HTTPException(409, {
                    message: 'Institution already exists with this name.',
                });
            }
            if (error.name === 'NotFoundError') {
                throw new HTTPException(404, { message: 'Institution not found' });
            }
            throw error;
        }
    }

    static async deleteInstitution(dbClient: DbClient, id: string) {
        try {
            return await deleteInstitutionData({
                dbClient,
                id,
            });
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            if (code === 'P2003' || code === '23503') {
                throw new HTTPException(409, {
                    message: 'Cannot delete institution because it is being used.',
                });
            }
            if (error.name === 'NotFoundError') {
                throw new HTTPException(404, { message: 'Institution not found' });
            }
            throw error;
        }
    }
}

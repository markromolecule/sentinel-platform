import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { InstitutionService, type InstitutionKind } from '../institution.service';

type BranchTransition = {
    parentId: string | null;
    institutionKind: InstitutionKind;
};

export class InstitutionHierarchyService {
    private static async assertInstitutionExists(dbClient: DbClient, id: string) {
        return InstitutionService.getInstitutionById(dbClient, id);
    }

    private static assertCanLink(parentId: string, branchRecord: any) {
        if (branchRecord.institution_id === parentId) {
            throw new HTTPException(400, {
                message: 'An institution cannot be linked as a branch of itself.',
            });
        }

        if (branchRecord.parent_institution_id && branchRecord.parent_institution_id !== parentId) {
            throw new HTTPException(409, {
                message: 'Branch institution is already linked to another parent.',
            });
        }
    }

    private static async updateInstitutionHierarchy(
        dbClient: DbClient,
        institutionId: string,
        values: BranchTransition,
    ) {
        const updated = await dbClient
            .updateTable('institutions')
            .set({
                parent_institution_id: values.parentId,
                institution_kind: values.institutionKind,
                updated_at: new Date().toISOString(),
            })
            .where('id', '=', institutionId)
            .returning([
                'id as institution_id',
                'name',
                'code',
                'parent_institution_id',
                'institution_kind',
                'created_at',
                'created_by',
                'updated_at',
                'updated_by',
            ])
            .executeTakeFirstOrThrow();

        return InstitutionService.formatInstitution(updated);
    }

    static async getBranches(dbClient: DbClient, parentId: string) {
        await this.assertInstitutionExists(dbClient, parentId);

        const result = await InstitutionService.getInstitutions(dbClient, {
            parentInstitutionId: parentId,
            institutionKind: 'CHILD',
        });
        return Array.isArray(result) ? result : result.items;
    }

    static async linkBranch(dbClient: DbClient, parentId: string, branchId: string) {
        await this.assertInstitutionExists(dbClient, parentId);
        const branchRecord = await this.assertInstitutionExists(dbClient, branchId);
        this.assertCanLink(parentId, branchRecord);

        await this.updateInstitutionHierarchy(dbClient, parentId, {
            parentId: null,
            institutionKind: 'PARENT',
        });

        return this.updateInstitutionHierarchy(dbClient, branchId, {
            parentId,
            institutionKind: 'CHILD',
        });
    }

    static async unlinkBranch(dbClient: DbClient, parentId: string, branchId: string) {
        await this.assertInstitutionExists(dbClient, parentId);
        const branchRecord = await this.assertInstitutionExists(dbClient, branchId);

        if (branchRecord.parent_institution_id !== parentId) {
            throw new HTTPException(404, {
                message: 'Branch institution is not linked to this parent.',
            });
        }

        const unlinkedBranch = await this.updateInstitutionHierarchy(dbClient, branchId, {
            parentId: null,
            institutionKind: 'STANDALONE',
        });

        const remainingBranches = await this.getBranches(dbClient, parentId);

        if (remainingBranches.length === 0) {
            await this.updateInstitutionHierarchy(dbClient, parentId, {
                parentId: null,
                institutionKind: 'STANDALONE',
            });
        }

        return unlinkedBranch;
    }
}

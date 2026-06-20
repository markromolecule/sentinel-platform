/**
 * Institution Service (Facade)
 *
 * Re-exports from modular service files in `./services/` to preserve backward
 * compatibility for all consumers that import `InstitutionService` from this file.
 *
 * For new code, prefer importing directly from the specific service module:
 *
 *  services/institution-formatter.service         — formatInstitution, formatNamingConvention, mergeNamingRules, mergeNamingConventionRecords
 *  services/institution-hierarchy-constraints.service — assertHierarchyConstraints, getInstitutionByIdRaw
 *  services/get-institutions.service              — getInstitutions, getInstitutionById
 *  services/create-institution.service            — createInstitution
 *  services/update-institution.service            — updateInstitution
 *  services/delete-institution.service            — deleteInstitution
 *  services/delete-institutions.service           — deleteInstitutions
 *  services/institution-naming-convention.service — saveNamingConvention, getEffectiveNamingConvention
 */

import { type DbClient } from '@sentinel/db';
import {
    formatInstitution,
    formatNamingConvention,
    mergeNamingRules,
    mergeNamingConventionRecords,
    type InstitutionKind,
} from './services/institution-formatter.service';
import {
    assertHierarchyConstraints,
    getInstitutionByIdRaw,
} from './services/institution-hierarchy-constraints.service';
import { getInstitutions } from './services/get-institutions.service';
import { createInstitution } from './services/create-institution.service';
import { updateInstitution } from './services/update-institution.service';
import { deleteInstitution } from './services/delete-institution.service';
import { deleteInstitutions } from './services/delete-institutions.service';
import {
    saveNamingConvention,
    getEffectiveNamingConvention,
} from './services/institution-naming-convention.service';
import {
    type CreateInstitutionBody,
    type SaveInstitutionNamingConventionBody,
    type UpdateInstitutionBody,
} from './institution.dto';

export type { InstitutionKind };

/** @deprecated Import directly from the specific service modules listed above. */
export class InstitutionService {
    static formatInstitution = formatInstitution;
    static formatNamingConvention = formatNamingConvention;
    static mergeNamingRules = mergeNamingRules;
    static mergeNamingConventionRecords = mergeNamingConventionRecords;
    static assertHierarchyConstraints = assertHierarchyConstraints;

    /**
     * @deprecated Use `getInstitutionByIdRaw` from `services/institution-hierarchy-constraints.service`.
     */
    static getInstitutionById = (dbClient: DbClient, id: string) =>
        getInstitutionByIdRaw(dbClient, id);

    static getInstitutions = getInstitutions;

    static createInstitution = (
        _dbClient: DbClient,
        data: CreateInstitutionBody,
        createdBy: string,
    ) => createInstitution(_dbClient, data, createdBy, saveNamingConvention);

    static updateInstitution = (
        dbClient: DbClient,
        id: string,
        data: UpdateInstitutionBody,
        updatedBy: string,
    ) => updateInstitution(dbClient, id, data, updatedBy, saveNamingConvention);

    static deleteInstitution = deleteInstitution;
    static deleteInstitutions = deleteInstitutions;

    static saveNamingConvention = (
        dbClient: DbClient,
        institutionId: string,
        data: SaveInstitutionNamingConventionBody,
        userId?: string | null,
    ) => saveNamingConvention(dbClient, institutionId, data, userId);

    static getEffectiveNamingConvention = getEffectiveNamingConvention;
}

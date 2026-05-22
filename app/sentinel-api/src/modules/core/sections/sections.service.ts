import { getSectionsData } from './data/get-sections';
import { createSectionData, createSectionsData } from './data/create-section';
import { updateSectionData } from './data/update-section';
import { deleteSectionData } from './data/delete-section';
import { deleteSectionsData } from './data/delete-sections';
import { type DbClient } from '@sentinel/db';
import { HTTPException } from 'hono/http-exception';
import { loadEffectiveRows } from '../inheritance/effective-row-loader';
import {
    hideInheritedRecord,
    upsertInheritedOverride,
} from '../inheritance/inheritable-write-helper';
import { ActivityNotificationService } from '../../general/notification/services/activity-notification.service';

const SECTION_INHERITANCE_CONFIG = {
    table: 'sections',
    idColumn: 'section_id',
    copyColumns: [
        'section_name',
        'department_id',
        'course_id',
        'year_level',
        'created_by',
        'updated_by',
    ],
};

export class SectionService {
    static async getSections(
        dbClient: DbClient,
        institutionId?: string,
        search?: string,
        scope?: {
            departmentId?: string;
            courseId?: string;
        },
    ) {
        const rawSections = await loadEffectiveRows<any>({
            dbClient,
            institutionId,
            idKey: 'section_id',
            loadRows: (scopeInstitutionId) =>
                getSectionsData({
                    dbClient,
                    institutionId: scopeInstitutionId,
                    search,
                    departmentId: scope?.departmentId,
                    courseId: scope?.courseId,
                }),
        });

        return rawSections.map((section: any) => ({
            institution_id: section.institution_id,
            section_id: section.section_id,
            section_name: section.section_name,
            department_id: section.department_id,
            course_id: section.course_id,
            year_level: section.year_level,
            source_record_id: section.sourceRecordId,
            inheritance_status: section.inheritanceStatus,
            origin_institution_id: section.originInstitutionId,
            effective_institution_id: section.effectiveInstitutionId,
            is_local: section.isLocal,
            is_inherited: section.isInherited,
            is_overridden: section.isOverridden,
            is_hidden: section.isHidden,
            isLocal: section.isLocal,
            isInherited: section.isInherited,
            isOverridden: section.isOverridden,
            isHidden: section.isHidden,
            created_at: section.created_at,
            created_by: section.creator_first_name
                ? `${section.creator_first_name} ${section.creator_last_name}`
                : section.created_by,
            updated_at: section.updated_at,
            updated_by: section.updater_first_name
                ? `${section.updater_first_name} ${section.updater_last_name}`
                : section.updated_by,
            institution_name: section.institution_name,
            institutionName: section.institution_name,
            course_title: section.course_title,
            courseTitle: section.course_title,
            course_code: section.course_code,
            courseCode: section.course_code,
            department_name: section.department_name,
            departmentName: section.department_name,
        }));
    }

    static async createSection(
        dbClient: DbClient,
        data: {
            name: string;
            institutionId: string;
            department_id?: string | null;
            course_id?: string | null;
            year_level?: number;
            created_by?: string;
        },
    ) {
        const section = await createSectionData({
            dbClient,
            values: {
                section_name: data.name,
                department_id: data.department_id ?? null,
                course_id: data.course_id ?? null,
                year_level: data.year_level ?? null,
                created_by: data.created_by,
                institution_id: data.institutionId,
            },
        });

        if (data.created_by) {
            await ActivityNotificationService.notifySectionCreated({
                dbClient,
                actorUserId: data.created_by,
                institutionId: data.institutionId,
                sectionId: section.section_id,
                sectionLabel: section.section_name,
            });
        }

        return section;
    }

    /**
     * Creates multiple sections in a single operation.
     *
     * @param dbClient - Database client
     * @param data - Bulk creation payload including institution and optional scope
     * @returns A promise resolving to the created sections
     */
    static async createBulkSections(
        dbClient: DbClient,
        data: {
            institutionId: string;
            department_id?: string | null;
            course_id?: string | null;
            sections: {
                name: string;
                year_level?: number;
            }[];
            created_by?: string;
        },
    ) {
        const sections = await createSectionsData({
            dbClient,
            values: data.sections.map((s) => ({
                section_name: s.name,
                department_id: data.department_id ?? null,
                course_id: data.course_id ?? null,
                year_level: s.year_level ?? null,
                created_by: data.created_by,
                institution_id: data.institutionId,
            })),
        });

        if (data.created_by) {
            await ActivityNotificationService.notifySectionsBulkCreated({
                dbClient,
                actorUserId: data.created_by,
                institutionId: data.institutionId,
                count: sections.length,
            });
        }

        return sections;
    }

    static async updateSection(
        dbClient: DbClient,
        id: string,
        data: {
            name?: string;
            department_id?: string | null;
            course_id?: string | null;
            year_level?: number;
            updated_by?: string;
            institutionId?: string;
        },
    ) {
        const overrideSection = await upsertInheritedOverride({
            dbClient,
            config: SECTION_INHERITANCE_CONFIG,
            id,
            institutionId: data.institutionId,
            actorId: data.updated_by,
            values: {
                ...(data.name !== undefined ? { section_name: data.name } : {}),
                ...(data.department_id !== undefined ? { department_id: data.department_id } : {}),
                ...(data.course_id !== undefined ? { course_id: data.course_id } : {}),
                ...(data.year_level !== undefined ? { year_level: data.year_level } : {}),
                updated_by: data.updated_by,
                updated_at: new Date(),
            },
        });

        if (overrideSection) {
            if (data.updated_by && data.institutionId) {
                await ActivityNotificationService.notifySectionUpdated({
                    dbClient,
                    actorUserId: data.updated_by,
                    institutionId: data.institutionId,
                    sectionId: overrideSection.section_id,
                    sectionLabel: overrideSection.section_name,
                });
            }

            return overrideSection;
        }

        const section = await updateSectionData({
            dbClient,
            id,
            values: {
                ...(data.name !== undefined ? { section_name: data.name } : {}),
                ...(data.department_id !== undefined ? { department_id: data.department_id } : {}),
                ...(data.course_id !== undefined ? { course_id: data.course_id } : {}),
                ...(data.year_level !== undefined ? { year_level: data.year_level } : {}),
                updated_by: data.updated_by,
                updated_at: new Date().toISOString(),
            },
            institutionId: data.institutionId,
        });

        if (data.updated_by && data.institutionId) {
            await ActivityNotificationService.notifySectionUpdated({
                dbClient,
                actorUserId: data.updated_by,
                institutionId: data.institutionId,
                sectionId: section.section_id,
                sectionLabel: section.section_name,
            });
        }

        return section;
    }

    static async deleteSection(
        dbClient: DbClient,
        id: string,
        institutionId?: string,
        actorUserId?: string,
    ) {
        try {
            const hiddenSection = await hideInheritedRecord({
                dbClient,
                config: SECTION_INHERITANCE_CONFIG,
                id,
                institutionId,
            });

            if (hiddenSection) {
                if (hiddenSection.hidden_by && institutionId) {
                    await ActivityNotificationService.notifySectionDeleted({
                        dbClient,
                        actorUserId: hiddenSection.hidden_by,
                        institutionId,
                        sectionId: hiddenSection.section_id,
                        sectionLabel: hiddenSection.section_name,
                    });
                }

                return hiddenSection;
            }

            const deletedSection = await deleteSectionData({
                dbClient,
                id,
                institutionId,
            });

            if (institutionId) {
                await ActivityNotificationService.notifySectionDeleted({
                    dbClient,
                    actorUserId: actorUserId ?? id,
                    institutionId,
                    sectionId: deletedSection.section_id,
                    sectionLabel: deletedSection.section_name,
                });
            }

            return deletedSection;
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            if (code === 'P2003' || code === '23503') {
                throw new HTTPException(409, {
                    message:
                        'Cannot delete section because it is currently linked to other records.',
                });
            }
            throw error;
        }
    }

    static async deleteSections(
        dbClient: DbClient,
        ids: string[],
        institutionId?: string,
        actorUserId?: string,
    ) {
        try {
            const deletedSections = await deleteSectionsData({
                dbClient,
                ids,
                institutionId,
            });

            if (institutionId && deletedSections.length > 0) {
                await ActivityNotificationService.notifySectionDeleted({
                    dbClient,
                    actorUserId: actorUserId ?? ids[0],
                    institutionId,
                    sectionLabel: `${deletedSections.length} section${deletedSections.length === 1 ? '' : 's'}`,
                    bulk: true,
                    count: deletedSections.length,
                });
            }

            return deletedSections;
        } catch (error: any) {
            const code = error?.code ?? error?.cause?.code;
            if (code === 'P2003' || code === '23503') {
                throw new HTTPException(409, {
                    message:
                        'Cannot delete one or more sections because they are currently linked to other records.',
                });
            }
            throw error;
        }
    }
}

import { type DbClient, executeTransaction } from '@sentinel/db';
import {
    createSubjectOfferingData,
    createSubjectOfferingsData,
} from './data/create-subject-offering';
import { deleteSubjectOfferingData } from './data/delete-subject-offering';
import { getExistingSubjectOfferingsBySubjectsData } from './data/get-existing-subject-offerings-by-subjects';
import { getSubjectOfferingByIdData } from './data/get-subject-offering-by-id';
import { getSubjectOfferingBaseRecordData } from './data/get-subject-offering-base-record';
import { getSubjectOfferingsData } from './data/get-subject-offerings';
import { getSubjectRecordData } from './data/get-subject-record';
import { getSubjectRecordsByIdsData } from './data/get-subject-records-by-ids';
import { getTermRecordData } from './data/get-term-record';
import { updateSubjectOfferingData } from './data/update-subject-offering';
import { mapSubjectOfferingResponse } from './helper/map-subject-offering-response';
import {
    isMissingSubjectOfferingTableError,
    supportsSubjectOfferingTables,
} from './helper/subject-offering-compat';
import { buildSubjectOfferingError } from './helper/subject-offering-errors';
import { validateEffectiveInstitutionScope } from './helper/validate-institution-scope';
import { SubjectOfferingAssignmentsService } from './services/subject-offering-assignments.service';
import { loadEffectiveRows } from '../inheritance/effective-row-loader';
import { getCoursesData } from '../courses/data/get-courses';
import { getDepartmentsData } from '../departments/data/get-departments';
import { getSectionsData } from '../sections/data/get-sections';
import {
    buildCreateSubjectOfferingValues,
    buildUpdateSubjectOfferingValues,
    normalizeAssignments,
    type CreateSubjectOfferingPayload,
    type UpdateSubjectOfferingPayload,
} from './services/subject-offering-payload.service';
import { SubjectClassificationService } from '../subject-classification/subject-classification.service';

type PaginationMetadata = {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
};

type PaginatedResult<T> = {
    items: T[];
    pagination: PaginationMetadata;
};

function paginateItems<T>(items: T[], page?: number, limit?: number): T[] | PaginatedResult<T> {
    if (page === undefined || limit === undefined) {
        return items;
    }

    const offset = (page - 1) * limit;
    const paginatedItems = items.slice(offset, offset + limit);

    return {
        items: paginatedItems,
        pagination: {
            page,
            limit,
            total: items.length,
            hasMore: offset + paginatedItems.length < items.length,
        },
    };
}

type BulkSubjectOfferingPayload = {
    subject_classification_id: string;
    term_id: string;
    department_ids?: string[];
    course_ids?: string[];
    section_ids?: string[];
    year_levels?: number[];
    duplicate_strategy?: 'skip_existing' | 'fail_existing';
    created_by?: string | null;
    institution_id?: string | null;
};

type ClassificationSubjectForOffering = {
    id: string;
    code: string;
    title: string;
};

function isClassificationSubjectForOffering(
    value: unknown,
): value is ClassificationSubjectForOffering {
    return (
        Boolean(value) &&
        typeof value === 'object' &&
        typeof (value as ClassificationSubjectForOffering).id === 'string' &&
        typeof (value as ClassificationSubjectForOffering).code === 'string' &&
        typeof (value as ClassificationSubjectForOffering).title === 'string'
    );
}

function uniqueIds(values: string[] | undefined) {
    return Array.from(new Set(values ?? [])).filter((value) => value.trim() !== '');
}

async function assertEffectiveIdsVisible(args: {
    dbClient: DbClient;
    institutionId?: string | null;
    label: string;
    ids?: string[];
    idKey: string;
    loadRows: (institutionId?: string) => Promise<any[]>;
}) {
    const ids = uniqueIds(args.ids);

    if (ids.length === 0 || !args.institutionId) {
        return;
    }

    const effectiveRows = await loadEffectiveRows<any>({
        dbClient: args.dbClient,
        institutionId: args.institutionId,
        idKey: args.idKey,
        loadRows: args.loadRows,
    });
    const visibleIds = new Set<string>();

    for (const row of effectiveRows) {
        if (row[args.idKey]) {
            visibleIds.add(String(row[args.idKey]));
        }

        if (row.sourceRecordId) {
            visibleIds.add(String(row.sourceRecordId));
        }
    }

    const missingId = ids.find((id) => !visibleIds.has(id));

    if (missingId) {
        throw buildSubjectOfferingError(
            `${args.label} does not belong to the current institution`,
            '23503',
        );
    }
}

async function assertSubjectOfferingAssignmentsVisible(
    dbClient: DbClient,
    institutionId: string | null | undefined,
    payload: {
        department_ids?: string[];
        course_ids?: string[];
        section_ids?: string[];
    },
) {
    await Promise.all([
        assertEffectiveIdsVisible({
            dbClient,
            institutionId,
            label: 'Department',
            ids: payload.department_ids,
            idKey: 'department_id',
            loadRows: (scopeInstitutionId) =>
                getDepartmentsData({ dbClient, institutionId: scopeInstitutionId }),
        }),
        assertEffectiveIdsVisible({
            dbClient,
            institutionId,
            label: 'Course',
            ids: payload.course_ids,
            idKey: 'course_id',
            loadRows: (scopeInstitutionId) =>
                getCoursesData({ dbClient, institutionId: scopeInstitutionId ?? '' }),
        }),
        assertEffectiveIdsVisible({
            dbClient,
            institutionId,
            label: 'Section',
            ids: payload.section_ids,
            idKey: 'section_id',
            loadRows: (scopeInstitutionId) =>
                getSectionsData({ dbClient, institutionId: scopeInstitutionId }),
        }),
    ]);
}

async function ensureClassGroupsForSubjectOfferings(dbClient: DbClient) {
    const missingClassGroups = await dbClient
        .selectFrom('subject_offering_sections as sos')
        .innerJoin('subject_offerings as so', 'so.subject_offering_id', 'sos.subject_offering_id')
        .leftJoin('class_groups as cg', (join) =>
            join
                .onRef('cg.subject_offering_id', '=', 'sos.subject_offering_id')
                .onRef('cg.section_id', '=', 'sos.section_id'),
        )
        .select([
            'sos.subject_offering_id',
            'sos.section_id',
            'so.subject_id',
            'so.term_id',
            'so.institution_id',
        ])
        .where('cg.class_group_id', 'is', null)
        .execute();

    if (missingClassGroups.length > 0) {
        await dbClient
            .insertInto('class_groups')
            .values(
                missingClassGroups.map((row) => ({
                    subject_id: row.subject_id,
                    subject_offering_id: row.subject_offering_id,
                    section_id: row.section_id,
                    term_id: row.term_id,
                    institution_id: row.institution_id,
                })),
            )
            .onConflict((conflict) =>
                conflict
                    .columns(['subject_id', 'section_id', 'term_id', 'institution_id'])
                    .doNothing(),
            )
            .execute();
    }
}

export class SubjectOfferingsService {
    static async getSubjectOfferings(
        dbClient: DbClient,
        args: {
            institutionId?: string;
            departmentId?: string;
            courseId?: string;
            search?: string;
            subjectId?: string;
            termId?: string;
            visibility?: 'default' | 'requestable';
            instructorDepartmentId?: string;
            page?: number;
            limit?: number;
        },
    ) {
        const subjectOfferingTablesSupported = await supportsSubjectOfferingTables(dbClient);

        if (!subjectOfferingTablesSupported) {
            return [];
        }

        try {
            await ensureClassGroupsForSubjectOfferings(dbClient);

            const rawSubjectOfferings = await loadEffectiveRows<any>({
                institutionId: args.institutionId,
                dbClient,
                idKey: 'subject_offering_id',
                loadRows: (scopeInstitutionId) =>
                    getSubjectOfferingsData({
                        dbClient,
                        institutionId: scopeInstitutionId,
                        departmentId: args.departmentId,
                        courseId: args.courseId,
                        search: args.search,
                        subjectId: args.subjectId,
                        termId: args.termId,
                        visibility: args.visibility,
                        instructorDepartmentId: args.instructorDepartmentId,
                    }),
            });

            return paginateItems(
                rawSubjectOfferings.map(mapSubjectOfferingResponse),
                args.page,
                args.limit,
            );
        } catch (error) {
            if (isMissingSubjectOfferingTableError(error)) {
                return paginateItems([], args.page, args.limit);
            }

            throw error;
        }
    }

    static async getSubjectOfferingById(dbClient: DbClient, id: string, institutionId?: string) {
        const subjectOfferingTablesSupported = await supportsSubjectOfferingTables(dbClient);

        if (subjectOfferingTablesSupported) {
            try {
                await ensureClassGroupsForSubjectOfferings(dbClient);
            } catch (e) {
                // Ignore errors related to tables or triggers during ensure
            }
        }

        if (institutionId) {
            if (subjectOfferingTablesSupported) {
                const effectiveSubjectOfferings = await loadEffectiveRows<any>({
                    institutionId,
                    dbClient,
                    idKey: 'subject_offering_id',
                    loadRows: (scopeInstitutionId) =>
                        getSubjectOfferingsData({
                            dbClient,
                            institutionId: scopeInstitutionId,
                        }),
                });
                const effectiveSubjectOffering = effectiveSubjectOfferings.find(
                    (subjectOffering: any) =>
                        subjectOffering.subject_offering_id === id ||
                        subjectOffering.sourceRecordId === id,
                );

                if (effectiveSubjectOffering) {
                    return mapSubjectOfferingResponse(effectiveSubjectOffering);
                }
            }
        }

        const subjectOffering = await getSubjectOfferingByIdData({
            dbClient,
            id,
            institutionId,
        });

        return mapSubjectOfferingResponse(subjectOffering);
    }

    static async createSubjectOffering(dbClient: DbClient, data: CreateSubjectOfferingPayload) {
        const subject = await getSubjectRecordData({
            dbClient,
            subjectId: data.subject_id,
        });
        const term = await getTermRecordData({
            dbClient,
            termId: data.term_id,
        });

        if (!subject) {
            throw buildSubjectOfferingError('Subject not found', 'P2025');
        }

        if (!term) {
            throw buildSubjectOfferingError('Term not found', 'P2025');
        }

        await validateEffectiveInstitutionScope(dbClient, subject, data.institution_id, 'Subject');
        await validateEffectiveInstitutionScope(dbClient, term, data.institution_id, 'Term');
        await assertSubjectOfferingAssignmentsVisible(dbClient, data.institution_id, data);

        const createdSubjectOffering = await createSubjectOfferingData({
            dbClient,
            values: buildCreateSubjectOfferingValues({
                payload: data,
                subjectInstitutionId: subject.institution_id,
                termInstitutionId: term.institution_id,
                term,
            }),
        });

        try {
            await SubjectOfferingAssignmentsService.updateAll(
                dbClient,
                createdSubjectOffering.subject_offering_id,
                normalizeAssignments(data),
            );

            return await SubjectOfferingsService.getSubjectOfferingById(
                dbClient,
                createdSubjectOffering.subject_offering_id,
                data.institution_id ?? undefined,
            );
        } catch (error) {
            await deleteSubjectOfferingData(dbClient, createdSubjectOffering.subject_offering_id);
            throw error;
        }
    }

    static async createSubjectOfferingsFromClassification(
        dbClient: DbClient,
        data: BulkSubjectOfferingPayload,
    ) {
        const duplicateStrategy = data.duplicate_strategy ?? 'skip_existing';
        const classification = await SubjectClassificationService.getSubjectClassification(
            dbClient,
            data.subject_classification_id,
            data.institution_id ?? undefined,
        );

        if (!classification) {
            throw buildSubjectOfferingError('Subject classification not found', 'P2025');
        }

        const classificationSubjects: ClassificationSubjectForOffering[] = Array.isArray(
            classification.subjects,
        )
            ? classification.subjects.filter(isClassificationSubjectForOffering)
            : [];
        const subjectIds = classificationSubjects
            .map((subject) => subject.id)
            .filter((subjectId): subjectId is string => Boolean(subjectId));

        if (subjectIds.length === 0) {
            throw buildSubjectOfferingError(
                'Subject classification has no assigned subjects',
                'EMPTY_SUBJECT_CLASSIFICATION',
            );
        }

        const term = await getTermRecordData({
            dbClient,
            termId: data.term_id,
        });

        if (!term) {
            throw buildSubjectOfferingError('Term not found', 'P2025');
        }

        await validateEffectiveInstitutionScope(dbClient, term, data.institution_id, 'Term');
        await assertSubjectOfferingAssignmentsVisible(dbClient, data.institution_id, data);

        const existingOfferings = await getExistingSubjectOfferingsBySubjectsData({
            dbClient,
            subjectIds,
            termId: data.term_id,
            institutionId: data.institution_id,
        });
        const existingOfferingBySubjectId = new Map(
            existingOfferings.map((offering) => [offering.subject_id, offering]),
        );

        if (existingOfferings.length > 0 && duplicateStrategy === 'fail_existing') {
            throw buildSubjectOfferingError(
                'One or more subjects are already offered for the selected term',
                'P2002',
            );
        }

        const skipped = classificationSubjects
            .map((subject) => {
                const existingOffering = existingOfferingBySubjectId.get(subject.id);

                if (!existingOffering) {
                    return null;
                }

                return {
                    subject_id: subject.id,
                    subject_code: subject.code,
                    subject_title: subject.title,
                    existing_subject_offering_id: existingOffering.subject_offering_id,
                    reason: 'already_offered' as const,
                };
            })
            .filter((subject): subject is NonNullable<typeof subject> => subject !== null);

        const subjectsToCreate = classificationSubjects.filter(
            (subject) => !existingOfferingBySubjectId.has(subject.id),
        );

        const subjectRecords = await getSubjectRecordsByIdsData({
            dbClient,
            subjectIds: subjectsToCreate.map((subject) => subject.id),
        });
        const subjectRecordById = new Map(
            subjectRecords.map((subjectRecord) => [subjectRecord.subject_id, subjectRecord]),
        );

        const subjectOfferingValues = await Promise.all(
            subjectsToCreate.map(async (subject) => {
                const subjectRecord = subjectRecordById.get(subject.id);

                if (!subjectRecord) {
                    throw buildSubjectOfferingError('Subject not found', 'P2025');
                }

                await validateEffectiveInstitutionScope(
                    dbClient,
                    subjectRecord,
                    data.institution_id,
                    'Subject',
                );

                return buildCreateSubjectOfferingValues({
                    payload: {
                        subject_id: subject.id,
                        term_id: data.term_id,
                        department_ids: data.department_ids,
                        course_ids: data.course_ids,
                        section_ids: data.section_ids,
                        year_levels: data.year_levels,
                        created_by: data.created_by,
                        institution_id: data.institution_id,
                    },
                    subjectInstitutionId: subjectRecord.institution_id,
                    termInstitutionId: term.institution_id,
                    term,
                });
            }),
        );

        const createdSubjectOfferings = await executeTransaction(async (trx) => {
            const createdRecords = await createSubjectOfferingsData({
                dbClient: trx,
                values: subjectOfferingValues,
            });

            await SubjectOfferingAssignmentsService.createAllForOfferings(
                trx,
                createdRecords.map((record) => record.subject_offering_id),
                normalizeAssignments(data),
            );

            return createdRecords;
        });

        const created = await Promise.all(
            createdSubjectOfferings.map((createdSubjectOffering) =>
                SubjectOfferingsService.getSubjectOfferingById(
                    dbClient,
                    createdSubjectOffering.subject_offering_id,
                    data.institution_id ?? undefined,
                ),
            ),
        );

        return {
            classification_id: classification.id ?? classification.subject_classification_id,
            classification_name: classification.name,
            term_id: data.term_id,
            created_count: created.length,
            skipped_count: skipped.length,
            total_subject_count: classificationSubjects.length,
            duplicate_strategy: duplicateStrategy,
            created,
            skipped,
        };
    }

    static async updateSubjectOffering(
        dbClient: DbClient,
        id: string,
        data: UpdateSubjectOfferingPayload,
    ) {
        const existingSubjectOffering = await getSubjectOfferingBaseRecordData({
            dbClient,
            id,
            institutionId: data.institution_id,
        });

        if (!existingSubjectOffering) {
            throw buildSubjectOfferingError('Subject offering not found', 'P2025');
        }

        const nextTermId = data.term_id ?? existingSubjectOffering.term_id;
        const termChanged =
            data.term_id !== undefined && data.term_id !== existingSubjectOffering.term_id;
        const term = await getTermRecordData({
            dbClient,
            termId: nextTermId,
        });

        if (!term) {
            throw buildSubjectOfferingError('Term not found', 'P2025');
        }

        await validateEffectiveInstitutionScope(dbClient, term, data.institution_id, 'Term');
        await assertSubjectOfferingAssignmentsVisible(dbClient, data.institution_id, data);

        await updateSubjectOfferingData({
            dbClient,
            id,
            values: buildUpdateSubjectOfferingValues({
                payload: data,
                nextTermId,
                term,
                existingStatus: existingSubjectOffering.status,
                termChanged,
            }),
        });

        await SubjectOfferingAssignmentsService.updatePartial(
            dbClient,
            id,
            normalizeAssignments(data),
        );

        return await SubjectOfferingsService.getSubjectOfferingById(
            dbClient,
            id,
            data.institution_id ?? undefined,
        );
    }

    static async deleteSubjectOffering(
        dbClient: DbClient,
        id: string,
        institutionId?: string | null,
    ) {
        const existingSubjectOffering = await getSubjectOfferingBaseRecordData({
            dbClient,
            id,
            institutionId: institutionId ?? undefined,
        });

        if (!existingSubjectOffering) {
            throw buildSubjectOfferingError('Subject offering not found', 'P2025');
        }

        await deleteSubjectOfferingData(dbClient, id, institutionId ?? undefined);
    }

    static async deleteSubjectOfferings(
        dbClient: DbClient,
        ids: string[],
        institutionId?: string | null,
    ) {
        for (const id of ids) {
            await this.deleteSubjectOffering(dbClient, id, institutionId);
        }
    }
}

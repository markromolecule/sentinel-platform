import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubjectClassificationService } from './subject-classification.service';
import { getSubjectClassificationsData } from './data/get-subject-classifications';
import { loadEffectiveRows } from '../inheritance/effective-row-loader';

vi.mock('./data/get-subject-classifications', () => ({
    getSubjectClassificationsData: vi.fn(),
}));

vi.mock('../inheritance/effective-row-loader', () => ({
    loadEffectiveRows: vi.fn(),
}));

vi.mock('../subjects/helper/subject-offering-compat', () => ({
    supportsSubjectClassificationTables: vi.fn().mockResolvedValue(true),
    isMissingSubjectOfferingColumnError: vi.fn().mockReturnValue(false),
}));

describe('SubjectClassificationService read scope', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns inherited effective classifications for parent-visible institution scopes', async () => {
        const dbClient = {
            selectFrom: vi.fn((table: string) => {
                if (table === 'institutions') {
                    return {
                        select: vi.fn((columns: string | string[]) => {
                            if (Array.isArray(columns)) {
                                return {
                                    where: vi.fn(() => ({
                                        executeTakeFirstOrThrow: vi.fn().mockResolvedValue({
                                            id: 'parent-1',
                                            parent_institution_id: 'root-1',
                                            institution_kind: 'PARENT',
                                        }),
                                    })),
                                };
                            }

                            return {
                                where: vi.fn(() => ({
                                    execute: vi
                                        .fn()
                                        .mockResolvedValue([
                                            { id: 'branch-1' },
                                            { id: 'branch-2' },
                                        ]),
                                })),
                            };
                        }),
                    };
                }

                throw new Error(`Unexpected table: ${table}`);
            }),
        } as any;

        vi.mocked(loadEffectiveRows).mockImplementation(async ({ institutionId }) => {
            if (institutionId === 'parent-1') {
                return [
                    {
                        subject_classification_id: 'root-shared',
                        name: 'Root Shared',
                        classification_type: 'GENERAL',
                        description: null,
                        institution_id: 'root-1',
                        subjects: [],
                        course_ids: [],
                        subject_count: 0,
                        sourceRecordId: 'root-shared',
                        inheritanceStatus: 'INHERITED',
                        effectiveInstitutionId: 'parent-1',
                        isInherited: true,
                        isLocal: false,
                    },
                ] as any;
            }

            if (institutionId === 'branch-1') {
                return [
                    {
                        subject_classification_id: 'branch-local',
                        name: 'Branch Local',
                        classification_type: 'CORE',
                        description: null,
                        institution_id: 'branch-1',
                        subjects: [],
                        course_ids: [],
                        subject_count: 0,
                        sourceRecordId: null,
                        inheritanceStatus: 'LOCAL',
                        effectiveInstitutionId: 'branch-1',
                        isInherited: false,
                        isLocal: true,
                    },
                ] as any;
            }

            return [] as any;
        });

        const result = (await SubjectClassificationService.getSubjectClassifications(
            dbClient,
            'parent-1',
        )) as any[];

        expect(loadEffectiveRows).toHaveBeenCalledTimes(3);
        expect(result.map((record: any) => record.subject_classification_id)).toEqual([
            'branch-local',
            'root-shared',
        ]);
        expect(
            result.find((record: any) => record.subject_classification_id === 'root-shared'),
        ).toMatchObject({
            institution_id: 'root-1',
            effective_institution_id: 'parent-1',
            inheritance_status: 'INHERITED',
            isInherited: true,
        });
    });

    it('returns an inherited classification by source id for parent institution accounts', async () => {
        const dbClient = {
            selectFrom: vi.fn((table: string) => {
                if (table === 'institutions') {
                    return {
                        select: vi.fn((columns: string | string[]) => {
                            if (Array.isArray(columns)) {
                                return {
                                    where: vi.fn(() => ({
                                        executeTakeFirstOrThrow: vi.fn().mockResolvedValue({
                                            id: 'parent-1',
                                            parent_institution_id: null,
                                            institution_kind: 'PARENT',
                                        }),
                                    })),
                                };
                            }

                            return {
                                where: vi.fn(() => ({
                                    execute: vi.fn().mockResolvedValue([{ id: 'branch-1' }]),
                                })),
                            };
                        }),
                    };
                }

                throw new Error(`Unexpected table: ${table}`);
            }),
        } as any;

        vi.mocked(loadEffectiveRows).mockImplementation(async ({ institutionId }) => {
            if (institutionId === 'parent-1') {
                return [] as any;
            }

            if (institutionId === 'branch-1') {
                return [
                    {
                        subject_classification_id: 'branch-copy-1',
                        name: 'Parent Shared',
                        classification_type: 'GENERAL',
                        description: null,
                        institution_id: 'parent-1',
                        subjects: [],
                        course_ids: [],
                        subject_count: 0,
                        sourceRecordId: 'parent-shared',
                        inheritanceStatus: 'INHERITED',
                        effectiveInstitutionId: 'branch-1',
                        isInherited: true,
                        isLocal: false,
                    },
                ] as any;
            }

            return [] as any;
        });

        const result = await SubjectClassificationService.getSubjectClassification(
            dbClient,
            'parent-shared',
            'parent-1',
        );

        expect(loadEffectiveRows).toHaveBeenCalledTimes(2);
        expect(result).toMatchObject({
            subject_classification_id: 'branch-copy-1',
            source_record_id: 'parent-shared',
            inheritance_status: 'INHERITED',
            isInherited: true,
        });
    });
});

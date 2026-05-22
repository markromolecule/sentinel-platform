import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubjectClassificationService } from './subject-classification.service';
import { getSubjectClassificationsData } from './data/get-subject-classifications';
import { getSubjectClassificationByIdData } from './data/get-subject-classification-by-id';

vi.mock('./data/get-subject-classifications', () => ({
    getSubjectClassificationsData: vi.fn(),
}));

vi.mock('./data/get-subject-classification-by-id', () => ({
    getSubjectClassificationByIdData: vi.fn(),
}));

vi.mock('../subjects/helper/subject-offering-compat', () => ({
    supportsSubjectClassificationTables: vi.fn().mockResolvedValue(true),
    isMissingSubjectOfferingColumnError: vi.fn().mockReturnValue(false),
}));

describe('SubjectClassificationService read scope', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns parent and branch classifications for parent institution accounts', async () => {
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

        vi.mocked(getSubjectClassificationsData).mockImplementation(async ({ institutionId }) => {
            if (institutionId === 'parent-1') {
                return [
                    {
                        subject_classification_id: 'parent-classification',
                        name: 'Parent Shared',
                        classification_type: 'GENERAL',
                        description: null,
                        institution_id: 'parent-1',
                        subjects: [],
                        course_ids: [],
                        subject_count: 0,
                    },
                ] as any;
            }

            if (institutionId === 'branch-1') {
                return [
                    {
                        subject_classification_id: 'branch-classification',
                        name: 'Branch Scoped',
                        classification_type: 'CORE',
                        description: null,
                        institution_id: 'branch-1',
                        subjects: [],
                        course_ids: [],
                        subject_count: 0,
                    },
                ] as any;
            }

            return [];
        });

        const result = await SubjectClassificationService.getSubjectClassifications(
            dbClient,
            'parent-1',
        );

        expect(getSubjectClassificationsData).toHaveBeenCalledTimes(3);
        expect(result.map((record) => record.subject_classification_id)).toEqual([
            'branch-classification',
            'parent-classification',
        ]);
        expect(
            result.find((record) => record.subject_classification_id === 'branch-classification'),
        ).toMatchObject({
            institution_id: 'branch-1',
            effective_institution_id: 'parent-1',
            isLocal: true,
        });
    });

    it('returns a branch-owned classification by id for parent institution accounts', async () => {
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

        vi.mocked(getSubjectClassificationByIdData)
            .mockRejectedValueOnce(new Error('No result'))
            .mockResolvedValueOnce({
                subject_classification_id: 'branch-classification',
                name: 'Branch Scoped',
                classification_type: 'CORE',
                description: null,
                institution_id: 'branch-1',
                subjects: [],
                course_ids: [],
                subject_count: 0,
            } as any);

        const result = await SubjectClassificationService.getSubjectClassification(
            dbClient,
            'branch-classification',
            'parent-1',
        );

        expect(getSubjectClassificationByIdData).toHaveBeenNthCalledWith(1, {
            dbClient,
            id: 'branch-classification',
            institutionId: 'parent-1',
        });
        expect(getSubjectClassificationByIdData).toHaveBeenNthCalledWith(2, {
            dbClient,
            id: 'branch-classification',
            institutionId: 'branch-1',
        });
        expect(result).toMatchObject({
            subject_classification_id: 'branch-classification',
            institution_id: 'branch-1',
            effective_institution_id: 'parent-1',
        });
    });
});

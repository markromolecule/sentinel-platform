import { describe, expect, it } from 'vitest';
import { resolveCalendarScopeInstitutionIds } from './resolve-calendar-scope-institution-ids';

function createDbClientMock(args: {
    parentInstitutionId?: string | null;
    childInstitutionIds?: string[];
}) {
    const { parentInstitutionId = null, childInstitutionIds = [] } = args;

    return {
        selectFrom(table: string) {
            if (table !== 'institutions') {
                throw new Error(`Unexpected table: ${table}`);
            }

            return {
                select(selection: string | string[]) {
                    const selectingParent =
                        Array.isArray(selection) &&
                        selection.includes('parent_institution_id');
                    const selectingChildren = selection === 'id';

                    if (!selectingParent && !selectingChildren) {
                        throw new Error(`Unexpected selection: ${String(selection)}`);
                    }

                    return {
                        where(column: string, operator: string, value: string) {
                            if (selectingParent) {
                                expect(column).toBe('id');
                                expect(operator).toBe('=');
                                expect(value).toBeTruthy();

                                return {
                                    executeTakeFirst: async () => ({
                                        parent_institution_id: parentInstitutionId,
                                    }),
                                };
                            }

                            expect(column).toBe('parent_institution_id');
                            expect(operator).toBe('=');
                            expect(value).toBeTruthy();

                            return {
                                execute: async () =>
                                    childInstitutionIds.map((id) => ({
                                        id,
                                    })),
                            };
                        },
                    };
                },
            };
        },
    } as any;
}

describe('resolveCalendarScopeInstitutionIds', () => {
    it('includes the active institution, its parent, and its direct children', async () => {
        const dbClient = createDbClientMock({
            parentInstitutionId: 'parent-inst',
            childInstitutionIds: ['child-a', 'child-b'],
        });

        const result = await resolveCalendarScopeInstitutionIds(dbClient, 'branch-inst');

        expect(result).toEqual(['branch-inst', 'parent-inst', 'child-a', 'child-b']);
    });

    it('deduplicates overlapping hierarchy ids', async () => {
        const dbClient = createDbClientMock({
            parentInstitutionId: 'parent-inst',
            childInstitutionIds: ['parent-inst', 'child-a', 'child-a'],
        });

        const result = await resolveCalendarScopeInstitutionIds(dbClient, 'parent-inst');

        expect(result).toEqual(['parent-inst', 'child-a']);
    });

    it('returns an empty list when no institution id is provided', async () => {
        const dbClient = createDbClientMock({});

        const result = await resolveCalendarScopeInstitutionIds(dbClient, '');

        expect(result).toEqual([]);
    });
});

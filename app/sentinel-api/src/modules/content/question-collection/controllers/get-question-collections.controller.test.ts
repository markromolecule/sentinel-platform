import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getQuestionCollectionsRouteHandler } from './get-question-collections.controller';

vi.mock('../../../examination/assessment/assessment-access', () => ({
    assertAssessmentAccess: vi.fn(),
    resolveAssessmentInstitutionId: vi.fn(
        ({ contextInstitutionId }: { contextInstitutionId: string | null }) =>
            contextInstitutionId ?? undefined,
    ),
}));

function createQuery(result: unknown[] = []) {
    const query: any = {
        leftJoin: vi.fn(() => query),
        select: vi.fn(() => query),
        where: vi.fn((arg?: unknown) => {
            if (typeof arg === 'function') {
                arg(makeExpressionBuilder());
            }

            return query;
        }),
        whereRef: vi.fn(() => query),
        groupBy: vi.fn(() => query),
        orderBy: vi.fn(() => query),
        execute: vi.fn(async () => result),
    };

    return query;
}

function makeExpressionBuilder() {
    const queryFactory = () => createQuery();

    const eb: any = (...args: unknown[]) => args;
    eb.or = (items: unknown[]) => items;
    eb.exists = (subquery: unknown) => subquery;
    eb.selectFrom = () => queryFactory();

    return eb;
}

function createContext() {
    const row = {
        collection_id: 'collection-1',
        institution_id: 'inst-1',
        name: 'Private collection',
        description: 'Created by the current user',
        tags: [],
        is_public: false,
        created_at: new Date('2026-06-15T00:00:00Z'),
        updated_at: new Date('2026-06-15T00:00:00Z'),
        created_by: 'creator-1',
        updated_by: 'creator-1',
        creator_first_name: 'Creator',
        creator_last_name: 'One',
        updater_first_name: 'Creator',
        updater_last_name: 'One',
        question_count: 0,
    };

    const mockDbClient = {
        selectFrom: vi.fn(() => createQuery([row])),
    };

    return {
        req: {
            valid: (type: string) =>
                type === 'query'
                    ? {
                          institutionId: 'inst-1',
                      }
                    : undefined,
        },
        get: (key: string) => {
            if (key === 'dbClient') {
                return mockDbClient;
            }

            if (key === 'user') {
                return { id: 'creator-1' };
            }

            if (key === 'supabaseUser') {
                return {
                    user_metadata: {
                        role: 'instructor',
                    },
                };
            }

            if (key === 'institutionId') {
                return 'inst-1';
            }

            return undefined;
        },
        json: vi.fn((payload: unknown) => payload),
    } as any;
}

describe('getQuestionCollectionsRouteHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns a private collection created by the current user', async () => {
        const c = createContext();
        const result = await getQuestionCollectionsRouteHandler(c);

        expect(result).toEqual({
            message: 'Collections fetched successfully',
            data: [
                expect.objectContaining({
                    id: 'collection-1',
                    name: 'Private collection',
                    isPublic: false,
                    createdById: 'creator-1',
                    updatedById: 'creator-1',
                }),
            ],
        });
    });
});

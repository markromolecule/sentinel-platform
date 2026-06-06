import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    checkInstructorQualification,
    getQualificationMode,
} from './classroom-instructor-qualification.service';

function createSelectBuilder<T>(result: T) {
    return {
        select: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        executeTakeFirst: vi.fn().mockResolvedValue(result),
    };
}

describe('classroom instructor qualification service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('checkInstructorQualification', () => {
        it('returns false if instructor profile not found', async () => {
            const dbClient = {
                selectFrom: vi.fn().mockReturnValue(createSelectBuilder(undefined)),
            } as any;

            const result = await checkInstructorQualification({
                dbClient,
                instructorUserId: 'user-1',
                subjectId: 'sub-1',
            });

            expect(result).toEqual({
                isQualified: false,
                reason: 'Instructor profile not found.',
            });
        });

        it('returns true with explicit type if explicit qualification exists', async () => {
            const instructorRecBuilder = createSelectBuilder({ instructor_id: 'ins-1' });
            const explicitQualBuilder = createSelectBuilder({ instructor_subject_id: 'ex-1' });

            const dbClient = {
                selectFrom: vi.fn().mockImplementation((table) => {
                    if (table === 'instructors') return instructorRecBuilder;
                    return explicitQualBuilder;
                }),
            } as any;

            const result = await checkInstructorQualification({
                dbClient,
                instructorUserId: 'user-1',
                subjectId: 'sub-1',
            });

            expect(result).toEqual({
                isQualified: true,
                type: 'explicit',
            });
        });

        it('returns true with derived type if derived qualification exists', async () => {
            const instructorRecBuilder = createSelectBuilder({ instructor_id: 'ins-1' });
            const explicitQualBuilder = createSelectBuilder(undefined);
            const derivedQualBuilder = createSelectBuilder({ subject_id: 'sub-1' });

            let callCount = 0;
            const dbClient = {
                selectFrom: vi.fn().mockImplementation((table) => {
                    if (table === 'instructors') return instructorRecBuilder;
                    callCount++;
                    if (callCount === 1) return explicitQualBuilder;
                    return derivedQualBuilder;
                }),
            } as any;

            const result = await checkInstructorQualification({
                dbClient,
                instructorUserId: 'user-1',
                subjectId: 'sub-1',
            });

            expect(result).toEqual({
                isQualified: true,
                type: 'derived',
            });
        });

        it('returns false if no explicit or derived qualification exists', async () => {
            const instructorRecBuilder = createSelectBuilder({ instructor_id: 'ins-1' });
            const explicitQualBuilder = createSelectBuilder(undefined);
            const derivedQualBuilder = createSelectBuilder(undefined);

            let callCount = 0;
            const dbClient = {
                selectFrom: vi.fn().mockImplementation((table) => {
                    if (table === 'instructors') return instructorRecBuilder;
                    callCount++;
                    if (callCount === 1) return explicitQualBuilder;
                    return derivedQualBuilder;
                }),
            } as any;

            const result = await checkInstructorQualification({
                dbClient,
                instructorUserId: 'user-1',
                subjectId: 'sub-1',
            });

            expect(result).toEqual({
                isQualified: false,
                reason: 'Instructor does not have explicit or derived qualification for this subject.',
            });
        });
    });

    describe('getQualificationMode', () => {
        it('returns WARN by default if setting not configured', async () => {
            const dbClient = {
                selectFrom: vi.fn().mockReturnValue(createSelectBuilder(undefined)),
            } as any;

            const result = await getQualificationMode(dbClient);
            expect(result).toBe('WARN');
        });

        it('returns the uppercase value from setting_value if string', async () => {
            const dbClient = {
                selectFrom: vi
                    .fn()
                    .mockReturnValue(createSelectBuilder({ setting_value: 'block' })),
            } as any;

            const result = await getQualificationMode(dbClient);
            expect(result).toBe('BLOCK');
        });

        it('returns the nested mode property if setting_value is an object', async () => {
            const dbClient = {
                selectFrom: vi
                    .fn()
                    .mockReturnValue(createSelectBuilder({ setting_value: { mode: 'allow' } })),
            } as any;

            const result = await getQualificationMode(dbClient);
            expect(result).toBe('ALLOW');
        });
    });
});

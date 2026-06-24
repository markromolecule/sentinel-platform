import { HTTPException } from 'hono/http-exception';
import { describe, expect, it } from 'vitest';
import { assertExamOwnership } from './assert-exam-ownership';

describe('assertExamOwnership', () => {
    it('allows the owner to pass', () => {
        expect(() => assertExamOwnership('user-1', 'user-1')).not.toThrow();
    });

    it('blocks a non-owner instructor', () => {
        expect(() => assertExamOwnership('user-1', 'user-2', false, 'instructor')).toThrowError(
            HTTPException,
        );

        try {
            assertExamOwnership('user-1', 'user-2', false, 'instructor');
        } catch (error) {
            expect(error).toMatchObject({
                status: 403,
                message: 'You do not have permission to modify this exam.',
            });
        }
    });

    it('allows admin bypass', () => {
        expect(() => assertExamOwnership('user-1', 'user-2', false, 'admin')).not.toThrow();
    });

    it('allows superadmin bypass', () => {
        expect(() => assertExamOwnership('user-1', 'user-2', false, 'superadmin')).not.toThrow();
    });

    it('allows dynamic RBAC bypass when the caller has exam management permission', () => {
        expect(() => assertExamOwnership('user-1', 'user-2', true, 'instructor')).not.toThrow();
    });

    it('blocks missing creator values', () => {
        expect(() => assertExamOwnership(undefined, 'user-1')).toThrowError(HTTPException);
        expect(() => assertExamOwnership(null, 'user-1')).toThrowError(HTTPException);
    });
});

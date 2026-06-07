import { describe, expect, it, vi } from 'vitest';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { hasActivePermission, requireActivePermission, requirePermission } from './permissions';

describe('permissions utilities', () => {
    describe('hasActivePermission', () => {
        it('returns true when key is in the set', () => {
            const set = new Set(['rooms:view', 'semesters:view']);
            expect(hasActivePermission(set, 'rooms:view')).toBe(true);
        });

        it('returns false when key is absent', () => {
            const set = new Set(['rooms:view']);
            expect(hasActivePermission(set, 'rooms:manage')).toBe(false);
        });

        it('returns true when any key in an array matches', () => {
            const set = new Set(['rooms:view']);
            expect(hasActivePermission(set, ['rooms:manage', 'rooms:view'])).toBe(true);
        });

        it('supports passing an array of strings directly', () => {
            const arr = ['rooms:view', 'semesters:view'];
            expect(hasActivePermission(arr, 'rooms:view')).toBe(true);
            expect(hasActivePermission(arr, 'rooms:manage')).toBe(false);
        });

        it('supports Hono Context variable lookup', () => {
            const mockContext = {
                get: vi.fn().mockImplementation((key) => {
                    if (key === 'activePermissionKeys') {
                        return ['rooms:view'];
                    }
                    return null;
                }),
            } as unknown as Context;

            expect(hasActivePermission(mockContext, 'rooms:view')).toBe(true);
            expect(hasActivePermission(mockContext, 'rooms:manage')).toBe(false);
            expect(mockContext.get).toHaveBeenCalledWith('activePermissionKeys');
        });
    });

    describe('requireActivePermission', () => {
        it('does not throw when key is present in context', () => {
            const mockContext = {
                get: vi.fn().mockReturnValue(['rooms:view']),
            } as unknown as Context;

            expect(() => requireActivePermission(mockContext, 'rooms:view')).not.toThrow();
        });

        it('throws HTTP 403 when key is absent', () => {
            const mockContext = {
                get: vi.fn().mockReturnValue(['rooms:view']),
            } as unknown as Context;

            expect(() => requireActivePermission(mockContext, 'rooms:manage')).toThrow(
                HTTPException,
            );
            try {
                requireActivePermission(mockContext, 'rooms:manage');
            } catch (err: any) {
                expect(err.status).toBe(403);
            }
        });

        it('throws HTTP 403 when activePermissionKeys is empty', () => {
            const mockContext = {
                get: vi.fn().mockReturnValue([]),
            } as unknown as Context;

            expect(() => requireActivePermission(mockContext, 'rooms:view')).toThrow(HTTPException);
        });
    });

    describe('requirePermission middleware', () => {
        it('calls next() when key is present', async () => {
            const mockContext = {
                get: vi.fn().mockReturnValue(['rooms:view']),
            } as unknown as Context;
            const next = vi.fn();

            const middleware = requirePermission('rooms:view');
            await middleware(mockContext, next);

            expect(next).toHaveBeenCalled();
        });

        it('throws 403 when key is absent', async () => {
            const mockContext = {
                get: vi.fn().mockReturnValue(['rooms:view']),
            } as unknown as Context;
            const next = vi.fn();

            const middleware = requirePermission('rooms:manage');
            await expect(middleware(mockContext, next)).rejects.toThrow(HTTPException);
            expect(next).not.toHaveBeenCalled();
        });

        it('accepts an array and passes when any key matches', async () => {
            const mockContext = {
                get: vi.fn().mockReturnValue(['rooms:view']),
            } as unknown as Context;
            const next = vi.fn();

            const middleware = requirePermission(['rooms:manage', 'rooms:view']);
            await middleware(mockContext, next);

            expect(next).toHaveBeenCalled();
        });
    });
});

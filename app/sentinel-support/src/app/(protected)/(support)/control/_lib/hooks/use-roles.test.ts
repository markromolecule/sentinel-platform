import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from './use-roles';
import * as sentinelHooks from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useAccessControlRolesQuery: vi.fn().mockReturnValue({ data: 'mock-roles' }),
    useCreateAccessControlRoleMutation: vi.fn().mockReturnValue({ mutate: 'mock-create' }),
    useUpdateAccessControlRoleMutation: vi.fn().mockReturnValue({ mutate: 'mock-update' }),
    useDeleteAccessControlRoleMutation: vi.fn().mockReturnValue({ mutate: 'mock-delete' }),
}));

describe('use-roles hooks', () => {
    it('useRoles calls useAccessControlRolesQuery', () => {
        const { result } = renderHook(() => useRoles('search-term'));
        expect(sentinelHooks.useAccessControlRolesQuery).toHaveBeenCalledWith('search-term');
        expect(result.current.data).toBe('mock-roles');
    });

    it('useCreateRole calls useCreateAccessControlRoleMutation', () => {
        const { result } = renderHook(() => useCreateRole());
        expect(sentinelHooks.useCreateAccessControlRoleMutation).toHaveBeenCalled();
        expect(result.current.mutate).toBe('mock-create');
    });

    it('useUpdateRole calls useUpdateAccessControlRoleMutation', () => {
        const { result } = renderHook(() => useUpdateRole());
        expect(sentinelHooks.useUpdateAccessControlRoleMutation).toHaveBeenCalled();
        expect(result.current.mutate).toBe('mock-update');
    });

    it('useDeleteRole calls useDeleteAccessControlRoleMutation', () => {
        const { result } = renderHook(() => useDeleteRole());
        expect(sentinelHooks.useDeleteAccessControlRoleMutation).toHaveBeenCalled();
        expect(result.current.mutate).toBe('mock-delete');
    });
});

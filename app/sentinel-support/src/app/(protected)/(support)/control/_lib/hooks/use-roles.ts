import {
    useAccessControlRolesQuery,
    useCreateAccessControlRoleMutation,
    useUpdateAccessControlRoleMutation,
    useDeleteAccessControlRoleMutation,
} from '@sentinel/hooks';

/**
 * Custom hook wrapper to query all access-control roles.
 */
export function useRoles(search?: string) {
    return useAccessControlRolesQuery(search);
}

/**
 * Custom hook wrapper to create a new access-control role.
 */
export function useCreateRole() {
    return useCreateAccessControlRoleMutation();
}

/**
 * Custom hook wrapper to update an existing access-control role.
 */
export function useUpdateRole() {
    return useUpdateAccessControlRoleMutation();
}

/**
 * Custom hook wrapper to delete an access-control role.
 */
export function useDeleteRole() {
    return useDeleteAccessControlRoleMutation();
}

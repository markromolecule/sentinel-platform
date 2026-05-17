'use client';

import type { UserRole, User } from '@sentinel/shared/types';
import { useManagedUserForm } from '@/features/administration/users/hooks/use-managed-user-form';

interface UseUserFormProps {
    user?: User | null;
    onSuccess?: () => void;
    defaultRole?: UserRole;
}

/**
 * Backward-compatible wrapper for the shared managed user form hook.
 */
export function useUserForm({ user, onSuccess, defaultRole }: UseUserFormProps = {}) {
    return useManagedUserForm({
        user,
        onSuccess,
        defaultRole,
    });
}

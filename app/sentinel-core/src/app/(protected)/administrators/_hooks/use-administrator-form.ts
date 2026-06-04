'use client';

import type { User } from '@sentinel/shared/types';
import { useManagedUserForm } from '@/features/administration/users/hooks/use-managed-user-form';

interface UseAdministratorFormProps {
    user?: User | null;
    onSuccess?: () => void;
}

/**
 * Backward-compatible wrapper for the shared managed user form hook in administrator mode.
 */
export function useAdministratorForm({ user, onSuccess }: UseAdministratorFormProps = {}) {
    return useManagedUserForm({
        user,
        onSuccess,
        forcedRole: 'admin',
    });
}

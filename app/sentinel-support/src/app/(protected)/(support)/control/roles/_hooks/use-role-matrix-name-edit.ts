import { useState } from 'react';
import { useUpdateAccessControlRoleMutation } from '@sentinel/hooks';
import type { AccessControlRole } from '@sentinel/shared/types';
import { toast } from 'sonner';

/**
 * Custom hook to manage editing names of custom (non-system) access control roles in the Role Matrix.
 */
export function useRoleMatrixNameEdit() {
    const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
    const [editingRoleName, setEditingRoleName] = useState('');
    const [savingRoleIds, setSavingRoleIds] = useState<number[]>([]);

    const updateRoleMutation = useUpdateAccessControlRoleMutation();

    const startRoleNameEdit = (role: AccessControlRole) => {
        if (role.isSystem) {
            toast.info('System role names are locked and sync automatically.');
            return;
        }

        setEditingRoleId(role.id);
        setEditingRoleName(role.name);
    };

    const submitRoleNameEdit = async (role: AccessControlRole) => {
        const nextName = editingRoleName.trim();

        if (role.isSystem || nextName.length < 2 || nextName === role.name) {
            setEditingRoleId(null);
            setEditingRoleName('');
            return;
        }

        setSavingRoleIds((current) =>
            current.includes(role.id) ? current : [...current, role.id],
        );

        updateRoleMutation.mutate(
            {
                roleId: role.id,
                payload: {
                    name: nextName,
                },
            },
            {
                onSuccess: () => {
                    setEditingRoleId(null);
                    setEditingRoleName('');
                },
                onSettled: () => {
                    setSavingRoleIds((current) => current.filter((id) => id !== role.id));
                },
            },
        );
    };

    return {
        editingRoleId,
        editingRoleName,
        setEditingRoleId,
        setEditingRoleName,
        savingRoleIds,
        startRoleNameEdit,
        submitRoleNameEdit,
        updateRoleMutation,
    };
}

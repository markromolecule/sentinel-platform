'use client';

import { useDeleteUserMutation } from '@sentinel/hooks';
import { useState } from 'react';
import { User } from '@sentinel/shared/types';
import { toast } from 'sonner';

export function useUserManagement() {
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const deleteMutation = useDeleteUserMutation({
        onSuccess: () => {
            toast.success('User deleted successfully');
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            deleteMutation.mutate(userToDelete.id);
        }
    };

    return {
        editingUser,
        setEditingUser,
        handleDeleteUser,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        userToDelete,
        confirmDelete,
        isDeleting: deleteMutation.isPending,
    };
}

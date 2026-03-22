'use client';

import { useState } from 'react';
import { User } from '@sentinel/shared/types';
import { useDeleteUserMutation } from '@/hooks/query/users/use-delete-user-mutation';
import { toast } from 'sonner';

interface UseUserManagementProps {
    users: User[];
}

export function useUserManagement({ users }: UseUserManagementProps) {
    const [searchQuery, setSearchQuery] = useState('');
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

    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        const userWithStudentNo = user as User & { studentNo?: string };
        const matchesSearch =
            (user.firstName && user.firstName.toLowerCase().includes(query)) ||
            (user.lastName && user.lastName.toLowerCase().includes(query)) ||
            user.email.toLowerCase().includes(query) ||
            (userWithStudentNo.studentNo &&
                userWithStudentNo.studentNo.toLowerCase().includes(query));

        return matchesSearch;
    });

    return {
        searchQuery,
        setSearchQuery,
        filteredUsers,
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

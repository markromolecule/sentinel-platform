'use client';

import { useState } from 'react';
import { User } from '@sentinel/shared/types';
import { useDeleteUserMutation } from '@/hooks/query/users/use-delete-user-mutation';

interface UseUserManagementProps {
    users: User[];
}

export function useUserManagement({ users }: UseUserManagementProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const deleteMutation = useDeleteUserMutation();

    const handleDeleteUser = (user: User) => {
        if (confirm(`Are you sure you want to suspend/delete user ${user.email}?`)) {
            deleteMutation.mutate(user.id);
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
    };
}

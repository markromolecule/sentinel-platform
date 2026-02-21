"use client";

import { useState } from "react";
import { User } from '@sentinel/shared/types';;

interface UseUserManagementProps {
    users: User[];
}

export function useUserManagement({ users }: UseUserManagementProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            (user.firstName && user.firstName.toLowerCase().includes(query)) ||
            (user.lastName && user.lastName.toLowerCase().includes(query)) ||
            user.email.toLowerCase().includes(query) ||
            ((user as any).studentNo && (user as any).studentNo.toLowerCase().includes(query));

        return matchesSearch;
    });

    return {
        searchQuery,
        setSearchQuery,
        filteredUsers,
        editingUser,
        setEditingUser,
    };
}

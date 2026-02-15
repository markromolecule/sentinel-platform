"use client";

import { useState } from "react";
import { AdminUser } from "@/app/(protected)/admin/_types";

interface UseUserManagementProps {
    users: AdminUser[];
}

export function useUserManagement({ users }: UseUserManagementProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            user.firstName.toLowerCase().includes(query) ||
            user.lastName.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.studentNo && user.studentNo.toLowerCase().includes(query));

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

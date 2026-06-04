'use client';

import {
    useCoursesQuery,
    useDepartmentsQuery,
    useStableIdMap,
    useStableOptions,
    useStableValue,
} from '@sentinel/hooks';
import { User } from '@sentinel/shared/types';
import { useUserManagement } from '@/app/(protected)/administrators/_hooks/use-user-management';
import {
    DataTable,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@sentinel/ui';
import { columns } from '@/app/(protected)/administrators/_components/tables/user-columns';
import { EditUserDialog } from '@/app/(protected)/administrators/_components/dialogs/edit-user-dialog';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { UsersEmptyState } from './users-empty-state';
import { buildUserManagementFacets } from './user-management-facets';

interface UserManagementTableProps {
    users: User[];
    onlineUserIds: Set<string>;
    hideColumns?: string[];
    search?: string;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;
}

export function UserManagementTable({
    users,
    onlineUserIds,
    hideColumns = [],
    search,
    onSearchChange,
    isLoading = false,
}: UserManagementTableProps) {
    const [currentTab] = useState('all');

    const {
        editingUser,
        setEditingUser,
        handleDeleteUser,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        userToDelete,
        confirmDelete,
        isDeleting,
    } = useUserManagement();

    // Filter by role (tab)
    const roleFilteredUsers = useStableValue(
        () =>
            users.filter((user) => {
                if (currentTab === 'all') return true;
                return user.role === currentTab;
            }),
        [currentTab, users],
    );

    const { data: departments } = useDepartmentsQuery();
    const { data: courses } = useCoursesQuery();

    const departmentOptions = useStableOptions(
        departments || [],
        (department) => department.code || department.name,
    );

    const courseCodeById = useStableIdMap(courses || [], (course) => course.code?.trim() || '');

    const userColumns = useStableValue(
        () =>
            columns(setEditingUser, handleDeleteUser, onlineUserIds, courseCodeById).filter(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (col) => !hideColumns.includes((col as any).accessorKey || col.id),
            ),
        [courseCodeById, handleDeleteUser, hideColumns, onlineUserIds, setEditingUser],
    );

    const facets = useStableValue(
        () =>
            buildUserManagementFacets({
                departments: departmentOptions.map((department) => ({
                    name: department.label,
                    code: department.label,
                })),
            }),
        [departmentOptions],
    );

    return (
        <div className="space-y-4">
            <DataTable
                columns={userColumns}
                data={roleFilteredUsers}
                searchValue={search}
                onSearchChange={onSearchChange}
                searchKey="email"
                searchPlaceholder="Filter emails..."
                facets={facets}
                isLoading={isLoading}
                emptyContent={<UsersEmptyState search={search} />}
            />

            <EditUserDialog
                user={editingUser}
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will permanently delete the account for{' '}
                            <span className="font-semibold">{userToDelete?.email}</span> and remove
                            all associated data from the system. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Account'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

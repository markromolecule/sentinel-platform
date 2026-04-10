import { useDeleteUserMutation, useStableValue } from '@sentinel/hooks';
import { useCallback, useState } from 'react';
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
import { User } from '@sentinel/shared/types';
import { columns } from '@/app/(protected)/(support)/users/_components/tables/columns';
import { EditAdminDialog } from '@/app/(protected)/(support)/users/_components/dialogs/edit-admin-dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { AdministratorsEmptyState } from './administrators-empty-state';

interface AdministratorsListProps {
    administrators: User[];
    isLoading?: boolean;
}

export function AdministratorsList({ administrators, isLoading = false }: AdministratorsListProps) {
    const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
    const [adminToDelete, setAdminToDelete] = useState<User | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const deleteMutation = useDeleteUserMutation({
        onSuccess: () => {
            toast.success('Superadmin deleted successfully.');
            setIsDeleteDialogOpen(false);
            setAdminToDelete(null);
        },
        onError: (error) => toast.error(error.message),
    });

    const handleDelete = useCallback((admin: User) => {
        setAdminToDelete(admin);
        setIsDeleteDialogOpen(true);
    }, []);

    const confirmDelete = () => {
        if (adminToDelete) {
            deleteMutation.mutate(adminToDelete.id);
        }
    };

    const facets = useStableValue(
        () => [
            {
                columnKey: 'status',
                title: 'Status',
                options: [
                    { label: 'Online', value: 'active' },
                    { label: 'Offline', value: 'offline' },
                ],
            },
        ],
        [],
    );

    // Map AdminUser to User for the edit dialog
    const userToEdit = useStableValue(() => {
        if (!editingAdmin) return null;
        return {
            ...editingAdmin,
            institutionId: editingAdmin.institutionId ?? null,
            departmentId: editingAdmin.departmentId ?? null,
        } as User;
    }, [editingAdmin]);

    const administratorColumns = useStableValue(
        () => columns(setEditingAdmin, handleDelete),
        [handleDelete, setEditingAdmin],
    );

    return (
        <div className="space-y-4">
            <DataTable
                columns={administratorColumns}
                data={administrators}
                searchKey="email"
                searchPlaceholder="Search superadmins by email..."
                facets={facets}
                isLoading={isLoading}
                emptyContent={<AdministratorsEmptyState />}
            />

            <EditAdminDialog
                user={userToEdit}
                open={!!editingAdmin}
                onOpenChange={(open) => !open && setEditingAdmin(null)}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will permanently delete the superadmin account for
                            <strong>
                                {' '}
                                {adminToDelete?.firstName} {adminToDelete?.lastName}
                            </strong>{' '}
                            and remove all associated metadata. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
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

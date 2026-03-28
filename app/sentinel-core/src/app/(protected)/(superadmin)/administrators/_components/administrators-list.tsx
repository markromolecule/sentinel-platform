import { useState, useMemo } from "react";
import { DataTable, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@sentinel/ui";
import { AdminUser, User } from "@sentinel/shared/types";
import { columns } from "./columns";
import { EditAdminDialog } from "./edit-admin-dialog";
import { useDeleteUserMutation } from "@/hooks/query/users/use-delete-user-mutation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AdministratorsListProps {
    administrators: AdminUser[];
}

export function AdministratorsList({ administrators }: AdministratorsListProps) {
    const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
    const [adminToDelete, setAdminToDelete] = useState<AdminUser | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const deleteMutation = useDeleteUserMutation({
        onSuccess: () => {
            toast.success("Administrator deleted successfully.");
            setIsDeleteDialogOpen(false);
            setAdminToDelete(null);
        },
        onError: (error) => toast.error(error.message),
    });

    const handleDelete = (admin: AdminUser) => {
        setAdminToDelete(admin);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (adminToDelete) {
            deleteMutation.mutate(adminToDelete.id);
        }
    };

    const facets = [
        {
            columnKey: "role",
            title: "Role",
            options: [
                { label: "Super Admin", value: "superadmin" },
                { label: "Admin", value: "admin" },
            ],
        },
        {
            columnKey: "status",
            title: "Status",
            options: [
                { label: "Online", value: "active" },
                { label: "Offline", value: "offline" },
            ],
        },
    ];

    // Map AdminUser to User for the edit dialog
    const userToEdit = useMemo(() => {
        if (!editingAdmin) return null;
        return {
            ...editingAdmin,
            institutionId: editingAdmin.institutionId ?? null,
            departmentId: editingAdmin.departmentId ?? null,
        } as User;
    }, [editingAdmin]);

    return (
        <div className="space-y-4">
            <DataTable
                columns={columns(setEditingAdmin, handleDelete)}
                data={administrators}
                searchKey="email"
                searchPlaceholder="Search administrators by email..."
                facets={facets}
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
                            This action will permanently delete the administrator account for 
                            <strong> {adminToDelete?.firstName} {adminToDelete?.lastName}</strong> and remove all associated metadata. 
                            This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
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
                            ) : "Delete Account"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

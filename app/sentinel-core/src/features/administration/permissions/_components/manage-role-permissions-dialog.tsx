'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Button,
    ScrollArea,
    Checkbox,
    Label,
    Badge,
    Separator,
} from '@sentinel/ui';
import type { AccessControlRole } from '@sentinel/shared/types';
import { useReplaceAccessControlRolePermissionsMutation } from '@sentinel/hooks';
import { ALL_PERMISSIONS, PERMISSION_CATEGORIES } from '@sentinel/shared/constants';
import { toast } from 'sonner';

export interface ManageRolePermissionsDialogProps {
    role: AccessControlRole;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Dialog for managing granular permissions assigned to a specific role.
 * Links directly to the ReplaceAccessControlRolePermissions API mutation hook.
 */
export function ManageRolePermissionsDialog({
    role,
    open,
    onOpenChange,
}: ManageRolePermissionsDialogProps) {
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role.permissionIds || []);

    // Reset local state when the dialog is opened/closed or the role changes
    useEffect(() => {
        if (open) {
            setSelectedPermissions(role.permissionIds || []);
        }
    }, [role, open]);

    const replacePermissionsMutation = useReplaceAccessControlRolePermissionsMutation({
        onSuccess: () => {
            toast.success(`Permissions for "${role.name}" updated successfully.`);
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update permissions.');
        },
    });

    const togglePermission = (permissionId: string) => {
        setSelectedPermissions((current) =>
            current.includes(permissionId)
                ? current.filter((id) => id !== permissionId)
                : [...current, permissionId],
        );
    };

    const handleSave = () => {
        replacePermissionsMutation.mutate({
            roleId: role.id,
            permissionIds: selectedPermissions,
        });
    };

    // Group permissions by category
    const groupedPermissions = ALL_PERMISSIONS.reduce(
        (acc, permission) => {
            const category = permission.category || 'other';
            if (!acc[category]) acc[category] = [];
            acc[category].push(permission);
            return acc;
        },
        {} as Record<string, typeof ALL_PERMISSIONS>,
    );

    const isSaving = replacePermissionsMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <DialogTitle>Manage Permissions</DialogTitle>
                        <Badge variant="outline">{role.name}</Badge>
                    </div>
                    <DialogDescription>
                        Select the granular permissions assigned to this role.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="-mr-4 flex-1 pr-4">
                    <div className="space-y-6 py-4">
                        {Object.entries(PERMISSION_CATEGORIES).map(([key, label]) => {
                            const permissionsInCategory = groupedPermissions[key] || [];
                            if (permissionsInCategory.length === 0) return null;

                            return (
                                <div key={key} className="space-y-4">
                                    <h3 className="text-primary/85 px-1 text-xs font-semibold tracking-wider uppercase">
                                        {label}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {permissionsInCategory.map((permission) => (
                                            <div
                                                key={permission.id}
                                                className="hover:bg-accent/40 flex items-start space-y-0 space-x-3 rounded-md border p-4 shadow-sm transition-colors"
                                            >
                                                <Checkbox
                                                    id={permission.id}
                                                    checked={selectedPermissions.includes(
                                                        permission.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        togglePermission(permission.id)
                                                    }
                                                    disabled={isSaving}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <Label
                                                        htmlFor={permission.id}
                                                        className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-75"
                                                    >
                                                        {permission.name}
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs leading-normal">
                                                        {permission.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Separator className="mt-6" />
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

'use client';

import { useState } from 'react';
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
import { Role } from '@sentinel/shared/mock-data';
import { ALL_PERMISSIONS, PERMISSION_CATEGORIES } from '@sentinel/shared/constants';
import { toast } from 'sonner';

interface ManageRolePermissionsDialogProps {
    role: Role;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ManageRolePermissionsDialog({
    role,
    open,
    onOpenChange,
}: ManageRolePermissionsDialogProps) {
    // Simulate local state for permissions
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role.permissions);
    const [isSaving, setIsSaving] = useState(false);

    const togglePermission = (permissionId: string) => {
        setSelectedPermissions((current) =>
            current.includes(permissionId)
                ? current.filter((id) => id !== permissionId)
                : [...current, permissionId],
        );
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            toast.success(`Permissions for ${role.name} updated successfully (Simulated)`);
            onOpenChange(false);
        }, 1000);
    };

    // Group permissions by category
    const groupedPermissions = ALL_PERMISSIONS.reduce(
        (acc, permission) => {
            const category = permission.category;
            if (!acc[category]) acc[category] = [];
            acc[category].push(permission);
            return acc;
        },
        {} as Record<string, typeof ALL_PERMISSIONS>,
    );

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
                                    <h3 className="text-primary/80 px-1 text-sm font-semibold tracking-wider uppercase">
                                        {label}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {permissionsInCategory.map((permission) => (
                                            <div
                                                key={permission.id}
                                                className="hover:bg-accent/50 flex items-start space-y-0 space-x-3 rounded-md border p-4 shadow-sm transition-colors"
                                            >
                                                <Checkbox
                                                    id={permission.id}
                                                    checked={selectedPermissions.includes(
                                                        permission.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        togglePermission(permission.id)
                                                    }
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <Label
                                                        htmlFor={permission.id}
                                                        className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {permission.name}
                                                    </Label>
                                                    <p className="text-muted-foreground text-xs">
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
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

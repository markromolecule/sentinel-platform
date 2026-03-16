"use client";

import { useState } from "react";
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
    Separator
} from "@sentinel/ui";
import { Role } from "@sentinel/shared/mock-data";
import { ALL_PERMISSIONS, PERMISSION_CATEGORIES } from "@sentinel/shared/constants";
import { toast } from "sonner";

interface ManageRolePermissionsDialogProps {
    role: Role;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ManageRolePermissionsDialog({ role, open, onOpenChange }: ManageRolePermissionsDialogProps) {
    // Simulate local state for permissions
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role.permissions);
    const [isSaving, setIsSaving] = useState(false);

    const togglePermission = (permissionId: string) => {
        setSelectedPermissions(current => 
            current.includes(permissionId) 
                ? current.filter(id => id !== permissionId) 
                : [...current, permissionId]
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
    const groupedPermissions = ALL_PERMISSIONS.reduce((acc, permission) => {
        const category = permission.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(permission);
        return acc;
    }, {} as Record<string, typeof ALL_PERMISSIONS>);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <DialogTitle>Manage Permissions</DialogTitle>
                        <Badge variant="outline">{role.name}</Badge>
                    </div>
                    <DialogDescription>
                        Select the granular permissions assigned to this role.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4 -mr-4">
                    <div className="space-y-6 py-4">
                        {Object.entries(PERMISSION_CATEGORIES).map(([key, label]) => {
                            const permissionsInCategory = groupedPermissions[key] || [];
                            if (permissionsInCategory.length === 0) return null;

                            return (
                                <div key={key} className="space-y-4">
                                    <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider px-1">
                                        {label}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {permissionsInCategory.map((permission) => (
                                            <div 
                                                key={permission.id}
                                                className="flex items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm hover:bg-accent/50 transition-colors"
                                            >
                                                <Checkbox
                                                    id={permission.id}
                                                    checked={selectedPermissions.includes(permission.id)}
                                                    onCheckedChange={() => togglePermission(permission.id)}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <Label
                                                        htmlFor={permission.id}
                                                        className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {permission.name}
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
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
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

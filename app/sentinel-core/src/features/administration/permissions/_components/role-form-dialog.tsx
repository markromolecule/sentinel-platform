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
    Input,
    Label,
    Textarea,
} from '@sentinel/ui';
import {
    useCreateAccessControlRoleMutation,
    useUpdateAccessControlRoleMutation,
} from '@sentinel/hooks';
import type { AccessControlRole } from '@sentinel/shared/types';
import { toast } from 'sonner';

export interface RoleFormDialogProps {
    role?: AccessControlRole | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Dialog for creating a new role or editing an existing role.
 * Automatically switches mutation flows based on whether `role` is provided.
 */
export function RoleFormDialog({ role, open, onOpenChange }: RoleFormDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const isEdit = !!role;

    useEffect(() => {
        if (role) {
            setName(role.name);
            setDescription(role.description || '');
        } else {
            setName('');
            setDescription('');
        }
    }, [role, open]);

    const createMutation = useCreateAccessControlRoleMutation({
        onSuccess: () => {
            toast.success('Role created successfully.');
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const updateMutation = useUpdateAccessControlRoleMutation({
        onSuccess: () => {
            toast.success('Role updated successfully.');
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Role name is required.');
            return;
        }

        if (isEdit && role) {
            updateMutation.mutate({
                roleId: role.id,
                payload: { name, description },
            });
        } else {
            createMutation.mutate({ name, description, domainScope: ['app'] });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <form onSubmit={handleSave} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Edit Role' : 'Create Role'}</DialogTitle>
                        <DialogDescription>
                            {isEdit
                                ? 'Modify the details for this system role.'
                                : 'Define a new system role to group permissions.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="role-name">Role Name</Label>
                            <Input
                                id="role-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Course Coordinator"
                                disabled={isPending || role?.isSystem}
                            />
                            {role?.isSystem && (
                                <p className="text-muted-foreground text-xs">
                                    System-reserved roles cannot be renamed.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role-description">Description</Label>
                            <Textarea
                                id="role-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the responsibilities of this role..."
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

'use client';

import { useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Textarea,
} from '@sentinel/ui';
import type { AccessControlRole, AccessControlRoleInput } from '@sentinel/shared/types';

type RoleEditorDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role?: AccessControlRole | null;
    isPending?: boolean;
    onSubmit: (payload: AccessControlRoleInput) => void;
};

export function RoleEditorDialog({
    open,
    onOpenChange,
    role,
    isPending,
    onSubmit,
}: RoleEditorDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (!open) return;

        setName(role?.name ?? '');
        setDescription(role?.description ?? '');
    }, [open, role]);

    const isEditMode = Boolean(role);
    const isSystemRole = Boolean(role?.isSystem);
    const isDisabled = isPending || name.trim().length < 2;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit role' : 'Create role'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Refine the role definition before updating its assignments and permission coverage.'
                            : 'Create a new support-managed role for a custom responsibility or workflow.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="role-name">Role name</Label>
                        <Input
                            id="role-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="exam_configuration_manager"
                            disabled={isSystemRole || isPending}
                        />
                        {isSystemRole ? (
                            <p className="text-muted-foreground text-xs">
                                System roles can keep their name, but you can still update the
                                description and permission coverage.
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role-description">Description</Label>
                        <Textarea
                            id="role-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Describe what this role should be allowed to manage."
                            rows={4}
                            disabled={isPending}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() =>
                            onSubmit({
                                name: name.trim(),
                                description: description.trim() || null,
                            })
                        }
                        disabled={isDisabled}
                    >
                        {isPending ? 'Saving...' : isEditMode ? 'Save role' : 'Create role'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

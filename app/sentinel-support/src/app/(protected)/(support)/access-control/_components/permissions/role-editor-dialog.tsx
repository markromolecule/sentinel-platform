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
            <DialogContent className="sm:max-w-xl rounded-none border-muted/50 shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-8 bg-muted/5 border-b border-muted/50">
                    <DialogTitle className="text-[18px] font-bold tracking-tight">
                        {isEditMode ? 'Edit Role' : 'Create Role'}
                    </DialogTitle>
                    <DialogDescription className="text-[14px] leading-relaxed text-muted-foreground mt-2">
                        {isEditMode
                            ? 'Refine the role definition before updating its assignments and permission coverage.'
                            : 'Create a new support-managed role for a custom responsibility or workflow.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-8 grid gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="role-name" className="text-[12px] font-bold text-foreground">Role Name</Label>
                        <Input
                            id="role-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="exam_configuration_manager"
                            disabled={isSystemRole || isPending}
                            className="rounded-none border-muted/50 h-10 text-[14px] font-mono"
                        />
                        {isSystemRole ? (
                            <p className="text-muted-foreground text-[11px] font-medium leading-relaxed opacity-70">
                                System roles can keep their name, but you can still update the
                                description and permission coverage.
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role-description" className="text-[12px] font-bold text-foreground">Description</Label>
                        <Textarea
                            id="role-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Describe what this role should be allowed to manage."
                            rows={4}
                            disabled={isPending}
                            className="rounded-none border-muted/50 text-[14px] leading-relaxed resize-none"
                        />
                    </div>
                </div>

                <DialogFooter className="p-8 bg-muted/5 border-t border-muted/50 gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        className="rounded-none h-11 px-8 text-[12px] font-bold border-muted/50"
                    >
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
                        className="rounded-none h-11 px-8 text-[12px] font-bold bg-[#323d8f] hover:bg-[#323d8f]/90"
                    >
                        {isPending ? 'Saving...' : isEditMode ? 'Update Role' : 'Create Role'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

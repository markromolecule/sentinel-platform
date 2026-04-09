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
import type {
    AccessControlPermission,
    AccessControlPermissionInput,
} from '@sentinel/shared/types';

type PermissionEditorDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    permission?: AccessControlPermission | null;
    isPending?: boolean;
    onSubmit: (payload: AccessControlPermissionInput) => void;
};

export function PermissionEditorDialog({
    open,
    onOpenChange,
    permission,
    isPending,
    onSubmit,
}: PermissionEditorDialogProps) {
    const [form, setForm] = useState<AccessControlPermissionInput>({
        key: '',
        moduleKey: '',
        actionKey: '',
        category: '',
        scope: 'global',
        name: '',
        description: '',
    });

    useEffect(() => {
        if (!open) return;

        setForm({
            key: permission?.key ?? '',
            moduleKey: permission?.moduleKey ?? '',
            actionKey: permission?.actionKey ?? '',
            category: permission?.category ?? '',
            scope: permission?.scope ?? 'global',
            name: permission?.name ?? '',
            description: permission?.description ?? '',
        });
    }, [open, permission]);

    const isEditMode = Boolean(permission);
    const isSystemPermission = Boolean(permission?.isSystem);
    const isDisabled =
        isPending ||
        form.name.trim().length < 2 ||
        form.key.trim().length < 3 ||
        form.moduleKey.trim().length < 2 ||
        form.actionKey.trim().length < 2;

    const updateField = <K extends keyof AccessControlPermissionInput>(
        key: K,
        value: AccessControlPermissionInput[K],
    ) => setForm((current) => ({ ...current, [key]: value }));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit permission' : 'Create permission'}</DialogTitle>
                    <DialogDescription>
                        Define the module, action, and descriptive metadata that support uses in
                        the RBAC catalog.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="permission-name">Display name</Label>
                        <Input
                            id="permission-name"
                            value={form.name}
                            onChange={(event) => updateField('name', event.target.value)}
                            placeholder="Manage Examination Settings"
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="permission-key">Permission key</Label>
                        <Input
                            id="permission-key"
                            value={form.key}
                            onChange={(event) => updateField('key', event.target.value)}
                            placeholder="examinations.settings.manage"
                            disabled={isSystemPermission || isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="permission-module">Module key</Label>
                        <Input
                            id="permission-module"
                            value={form.moduleKey}
                            onChange={(event) => updateField('moduleKey', event.target.value)}
                            placeholder="examinations"
                            disabled={isSystemPermission || isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="permission-action">Action key</Label>
                        <Input
                            id="permission-action"
                            value={form.actionKey}
                            onChange={(event) => updateField('actionKey', event.target.value)}
                            placeholder="update_settings"
                            disabled={isSystemPermission || isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="permission-category">Category</Label>
                        <Input
                            id="permission-category"
                            value={form.category ?? ''}
                            onChange={(event) => updateField('category', event.target.value)}
                            placeholder="configuration"
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="permission-scope">Scope</Label>
                        <Input
                            id="permission-scope"
                            value={form.scope ?? ''}
                            onChange={(event) => updateField('scope', event.target.value)}
                            placeholder="global"
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="permission-description">Description</Label>
                        <Textarea
                            id="permission-description"
                            value={form.description ?? ''}
                            onChange={(event) => updateField('description', event.target.value)}
                            placeholder="Explain when and why this permission should be granted."
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
                                key: form.key.trim(),
                                moduleKey: form.moduleKey.trim(),
                                actionKey: form.actionKey.trim(),
                                category: form.category?.trim() || null,
                                scope: form.scope?.trim() || null,
                                name: form.name.trim(),
                                description: form.description?.trim() || null,
                            })
                        }
                        disabled={isDisabled}
                    >
                        {isPending ? 'Saving...' : isEditMode ? 'Save permission' : 'Create permission'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

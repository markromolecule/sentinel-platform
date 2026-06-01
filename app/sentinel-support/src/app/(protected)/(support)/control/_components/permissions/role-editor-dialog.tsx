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
            <DialogContent className="border-muted/50 overflow-hidden rounded-none p-0 shadow-2xl sm:max-w-xl">
                <DialogHeader className="bg-muted/5 border-muted/50 border-b p-8">
                    <DialogTitle className="text-[18px] font-bold tracking-tight">
                        {isEditMode ? 'Edit Role' : 'Create Role'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-2 text-[14px] leading-relaxed">
                        {isEditMode
                            ? 'Refine the role definition before updating its assignments and permission coverage.'
                            : 'Create a new support-managed role for a custom responsibility or workflow.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 p-8">
                    <div className="space-y-2">
                        <Label
                            htmlFor="role-name"
                            className="text-foreground text-[12px] font-bold"
                        >
                            Role Name
                        </Label>
                        <Input
                            id="role-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="exam_configuration_manager"
                            disabled={isSystemRole || isPending}
                            className="border-muted/50 h-10 rounded-none font-mono text-[14px]"
                        />
                        {isSystemRole ? (
                            <p className="text-muted-foreground text-[11px] leading-relaxed font-medium opacity-70">
                                System roles can keep their name, but you can still update the
                                description and permission coverage.
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="role-description"
                            className="text-foreground text-[12px] font-bold"
                        >
                            Description
                        </Label>
                        <Textarea
                            id="role-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Describe what this role should be allowed to manage."
                            rows={4}
                            disabled={isPending}
                            className="border-muted/50 resize-none rounded-none text-[14px] leading-relaxed"
                        />
                    </div>
                </div>

                <DialogFooter className="bg-muted/5 border-muted/50 gap-3 border-t p-8">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        className="border-muted/50 h-11 rounded-none px-8 text-[12px] font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() =>
                            onSubmit({
                                name: name.trim(),
                                description: description.trim() || null,
                                domainScope: role?.domainScope ?? ['app'],
                            })
                        }
                        disabled={isDisabled}
                        className="h-11 rounded-none bg-[#323d8f] px-8 text-[12px] font-bold hover:bg-[#323d8f]/90"
                    >
                        {isPending ? 'Saving...' : isEditMode ? 'Update Role' : 'Create Role'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

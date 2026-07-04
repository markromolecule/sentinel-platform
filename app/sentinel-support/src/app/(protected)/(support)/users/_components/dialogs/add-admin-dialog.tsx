'use client';

import { Button } from '@sentinel/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@sentinel/ui';
import { Form } from '@sentinel/ui';
import { useState } from 'react';
import { Loader2, UserCog } from 'lucide-react';
import { UserFormFields } from '@/app/(protected)/(support)/users/_components/forms';
import { useAdministratorForm } from '@/app/(protected)/(support)/users/_hooks/use-administrator-form';
import {
    getAdministratorRoleConfig,
    type AdministratorRole,
} from '@/app/(protected)/(support)/users/_lib/administrator-role-config';
import { useActivePermissions } from '@sentinel/hooks';

interface AddSuperAdminDialogProps {
    role: AdministratorRole;
    triggerLabel?: string;
}

export function AddSuperAdminDialog({ role, triggerLabel }: AddSuperAdminDialogProps) {
    const [open, setOpen] = useState(false);
    const config = getAdministratorRoleConfig(role);
    const { form, onSubmit, isPending } = useAdministratorForm({
        role,
        onSuccess: () => setOpen(false),
    });
    const isSubmitting = isPending || form.formState.isSubmitting;
    const { hasPermission } = useActivePermissions();

    const permission =
        role === 'superadmin'
            ? 'users:create_superadmin'
            : role === 'support'
              ? 'users:create_staff'
              : 'users:create_admin';
    if (!hasPermission(permission)) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <UserCog className="mr-2 h-4 w-4" />
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{config.inviteTitle}</DialogTitle>
                    <DialogDescription>{config.inviteDescription}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <UserFormFields form={form} role={role} />
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {config.creatingLabel}
                                    </>
                                ) : (
                                    config.createActionLabel
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

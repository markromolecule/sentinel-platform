'use client';

import { Button } from '@sentinel/ui';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import { Form } from '@sentinel/ui';
import { User } from '@sentinel/shared/types';
import { Loader2 } from 'lucide-react';
import { UserFormFields } from '@/app/(protected)/(support)/users/_components/forms';
import { useAdministratorForm } from '@/app/(protected)/(support)/users/_hooks/use-administrator-form';
import {
    getAdministratorRoleConfig,
    type AdministratorRole,
} from '@/app/(protected)/(support)/users/_lib/administrator-role-config';

interface EditSuperAdminDialogProps {
    role: AdministratorRole;
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditSuperAdminDialog({ role, user, open, onOpenChange }: EditSuperAdminDialogProps) {
    const config = getAdministratorRoleConfig(role);
    const { form, onSubmit, isPending } = useAdministratorForm({
        role,
        user,
        onSuccess: () => onOpenChange(false),
    });

    const isSubmitting = isPending || form.formState.isSubmitting;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit {config.tabLabel.slice(0, -1)} Profile</DialogTitle>
                    <DialogDescription>
                        Update account details for {user?.firstName} {user?.lastName}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <UserFormFields form={form} role={role} />
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {config.savingLabel}
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

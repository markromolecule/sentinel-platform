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

interface EditAdminDialogProps {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditAdminDialog({ user, open, onOpenChange }: EditAdminDialogProps) {
    const { form, onSubmit, isPending } = useAdministratorForm({
        user,
        onSuccess: () => onOpenChange(false),
    });

    const isSubmitting = isPending || form.formState.isSubmitting;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Superadmin Profile</DialogTitle>
                    <DialogDescription>
                        Update account details for {user?.firstName} {user?.lastName}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <UserFormFields form={form} />
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving Changes...
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

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
import { UserFormFields } from '@/app/(protected)/(admin)/users/_components';
import { useAdministratorForm } from '@/app/(protected)/(superadmin)/administrators/_hooks/use-administrator-form';

interface EditAdminDialogProps {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditAdminDialog({ user, open, onOpenChange }: EditAdminDialogProps) {
    const { form, onSubmit, watchedRole, shouldLockInstitution } = useAdministratorForm({
        user,
        onSuccess: () => onOpenChange(false),
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Administrator Profile</DialogTitle>
                    <DialogDescription>
                        Update account details for {user?.firstName} {user?.lastName}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <UserFormFields
                            form={form}
                            watchedRole={watchedRole}
                            isAdministratorForm={true}
                            lockInstitution={shouldLockInstitution}
                        />
                        <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

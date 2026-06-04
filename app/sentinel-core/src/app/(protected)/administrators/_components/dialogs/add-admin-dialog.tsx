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
import { UserFormFields } from '@/app/(protected)/administrators/_components';
import { useAdministratorForm } from '@/app/(protected)/administrators/_hooks/use-administrator-form';

export function AddAdminDialog() {
    const [open, setOpen] = useState(false);
    const { form, onSubmit, watchedRole, shouldLockInstitution, isPending } = useAdministratorForm({
        onSuccess: () => setOpen(false),
    });
    const isSubmitting = isPending || form.formState.isSubmitting;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <UserCog className="mr-2 h-4 w-4" />
                    Add Administrator
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Administrator</DialogTitle>
                    <DialogDescription>
                        Create a new administrator account with system-level access.
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
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Admin Account...
                                    </>
                                ) : (
                                    'Create Admin Account'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

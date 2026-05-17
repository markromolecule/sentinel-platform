'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Form,
} from '@sentinel/ui';
import { useStudentWhitelistForm } from '@/app/(protected)/(support)/users/whitelist/_hooks/use-student-whitelist-form';
import { StudentWhitelistFormFields } from '@/app/(protected)/(support)/users/whitelist/_components/forms/student-whitelist-form-fields';

interface AddStudentWhitelistDialogProps {
    triggerLabel?: string;
    triggerIcon?: React.ReactNode;
}

/**
 * Renders a dialog to add an individual student whitelist entry.
 */
export function AddStudentWhitelistDialog({
    triggerLabel = 'Add Whitelist Entry',
    triggerIcon = <Plus className="mr-2 h-4 w-4" />,
}: AddStudentWhitelistDialogProps) {
    const [open, setOpen] = useState(false);
    const { form, onSubmit, isPending } = useStudentWhitelistForm({
        onSuccess: () => setOpen(false),
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    {triggerIcon}
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>Add Student Whitelist Entry</DialogTitle>
                    <DialogDescription>
                        Add an approved student identity for onboarding verification.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <StudentWhitelistFormFields form={form} />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Create Entry'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

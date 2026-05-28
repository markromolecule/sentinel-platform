'use client';

import { useEditSemesterForm } from '../../_hooks/use-edit-semester-form';
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
import { Semester } from '@sentinel/shared/types';
import { SemesterFormFields } from './semester-form-fields';

interface EditSemesterDialogProps {
    semester: Semester;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditSemesterDialog({ semester, open, onOpenChange }: EditSemesterDialogProps) {
    const { form, onSubmit, isPending } = useEditSemesterForm(semester, () => onOpenChange(false));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Semester</DialogTitle>
                    <DialogDescription>Update the details for the semester/term.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <SemesterFormFields form={form} isPending={isPending} />
                        <DialogFooter>
                            <Button
                                disabled={isPending}
                                type="submit"
                                className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                            >
                                {isPending ? 'Updating...' : 'Update Semester'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

'use client';

import { useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Form,
} from '@sentinel/ui';
import { StudentWhitelist } from '@sentinel/shared/types';
import { useStudentWhitelistForm } from '@/app/(protected)/administrators/whitelist/_hooks/use-student-whitelist-form';
import { StudentWhitelistFormFields } from '@/app/(protected)/administrators/whitelist/_components/forms/student-whitelist-form-fields';

interface EditStudentWhitelistDialogProps {
    record: StudentWhitelist | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditStudentWhitelistDialog({
    record,
    open,
    onOpenChange,
}: EditStudentWhitelistDialogProps) {
    const { form, onSubmit, isPending } = useStudentWhitelistForm({
        record,
        onSuccess: () => onOpenChange(false),
    });

    useEffect(() => {
        if (!record) {
            return;
        }

        form.reset({
            institution_id: record.institutionId,
            department_id: record.departmentId,
            course_id: record.courseId,
            student_number: record.studentNumber,
            last_name: record.lastName,
            first_name: record.firstName || '',
            status: record.status,
        });
    }, [record, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>Edit Student Whitelist Entry</DialogTitle>
                    <DialogDescription>
                        Update the approved onboarding record for {record?.studentNumber}.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <StudentWhitelistFormFields form={form} />
                        <DialogFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

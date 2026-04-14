'use client';

import { useActivePermissions } from '@sentinel/hooks';
import { Button } from '@sentinel/ui';
import { Plus } from 'lucide-react';
import { useAddSubjectForm } from '@/app/(protected)/subjects/_hooks/use-add-subject-form';
import { SubjectFormDialog } from '@/app/(protected)/subjects/_components/dialogs/subject-form-dialog';
import { ADD_SUBJECT_DIALOG_COPY } from '@/app/(protected)/subjects/_components/dialogs/_constants/subject-form-dialog-copy';

export function AddSubjectDialog() {
    const { hasPermission } = useActivePermissions();
    const { form, onSubmit, isPending, open, setOpen } = useAddSubjectForm();

    if (!hasPermission('subjects:create')) {
        return null;
    }

    return (
        <SubjectFormDialog
            open={open}
            onOpenChange={setOpen}
            form={form}
            onSubmit={onSubmit}
            isPending={isPending}
            title={ADD_SUBJECT_DIALOG_COPY.title}
            description={ADD_SUBJECT_DIALOG_COPY.description}
            submitLabel={ADD_SUBJECT_DIALOG_COPY.submitLabel}
            submittingLabel={ADD_SUBJECT_DIALOG_COPY.submittingLabel}
            showCancelButton
            formVariant="compact"
            trigger={
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subject
                </Button>
            }
        />
    );
}

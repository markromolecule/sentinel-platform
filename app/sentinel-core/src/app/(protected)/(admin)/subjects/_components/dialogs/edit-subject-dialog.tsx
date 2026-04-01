'use client';

import { type MasterSubject } from '@sentinel/shared/types';
import { useEditSubjectForm } from '@/app/(protected)/(admin)/subjects/_hooks/use-edit-subject-form';
import { SubjectFormDialog } from '@/app/(protected)/(admin)/subjects/_components/dialogs/subject-form-dialog';
import { getEditSubjectDialogCopy } from '@/app/(protected)/(admin)/subjects/_components/dialogs/_constants/subject-form-dialog-copy';

interface EditSubjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subjectToEdit: MasterSubject | null;
}

export function EditSubjectDialog({ open, onOpenChange, subjectToEdit }: EditSubjectDialogProps) {
    const { form, onSubmit, isPending } = useEditSubjectForm(subjectToEdit, () =>
        onOpenChange(false),
    );

    if (!subjectToEdit) {
        return null;
    }

    const copy = getEditSubjectDialogCopy(subjectToEdit);

    return (
        <SubjectFormDialog
            open={open}
            onOpenChange={onOpenChange}
            form={form}
            onSubmit={onSubmit}
            isPending={isPending}
            title={copy.title}
            description={copy.description}
            submitLabel={copy.submitLabel}
            submittingLabel={copy.submittingLabel}
            showCancelButton
        />
    );
}

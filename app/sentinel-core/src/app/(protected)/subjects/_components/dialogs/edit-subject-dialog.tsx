'use client';

import { type MasterSubject } from '@sentinel/shared/types';
import { useEditSubjectForm } from '@/app/(protected)/subjects/_hooks/use-edit-subject-form';
import { SubjectFormDialog } from '@/app/(protected)/subjects/_components/dialogs/subject-form-dialog';
import { getEditSubjectDialogCopy } from '@/app/(protected)/subjects/_components/dialogs/_constants/subject-form-dialog-copy';
import { isParentOwnedRecord } from '@/components/common/inheritance-status-badge';

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
    const description = isParentOwnedRecord(subjectToEdit)
        ? 'This will create a local copy for your branch only. The parent value will remain unchanged for other branches.'
        : copy.description;

    return (
        <SubjectFormDialog
            open={open}
            onOpenChange={onOpenChange}
            form={form}
            onSubmit={onSubmit}
            isPending={isPending}
            title={copy.title}
            description={description}
            submitLabel={copy.submitLabel}
            submittingLabel={copy.submittingLabel}
            showCancelButton
        />
    );
}

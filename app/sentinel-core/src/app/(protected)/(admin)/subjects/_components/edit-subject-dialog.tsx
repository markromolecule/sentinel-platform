"use client";

import { type MasterSubject } from "@sentinel/shared/types";
import { useEditSubjectForm } from "@/app/(protected)/(admin)/subjects/_hooks/use-edit-subject-form";
import { SubjectFormDialog } from "@/app/(protected)/(admin)/subjects/_components/subject-form-dialog";

interface EditSubjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subjectToEdit: MasterSubject | null;
}

export function EditSubjectDialog({
    open,
    onOpenChange,
    subjectToEdit,
}: EditSubjectDialogProps) {
    const { form, onSubmit, isPending } = useEditSubjectForm(subjectToEdit, () =>
        onOpenChange(false),
    );

    if (!subjectToEdit) {
        return null;
    }

    return (
        <SubjectFormDialog
            open={open}
            onOpenChange={onOpenChange}
            form={form}
            onSubmit={onSubmit}
            isPending={isPending}
            title="Edit Subject"
            description={`Update details for "${subjectToEdit.code} - ${subjectToEdit.title}".`}
            submitLabel="Save Changes"
            submittingLabel="Saving..."
            showCancelButton
        />
    );
}

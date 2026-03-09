"use client";

import { Button } from "@sentinel/ui";
import { Plus } from "lucide-react";
import { useAddSubjectForm } from "@/app/(protected)/admin/subjects/_hooks/use-add-subject-form";
import { SubjectFormDialog } from "@/app/(protected)/admin/subjects/_components/subject-form-dialog";

export function AddSubjectDialog() {
    const { form, onSubmit, isPending, open, setOpen } = useAddSubjectForm();

    return (
        <SubjectFormDialog
            open={open}
            onOpenChange={setOpen}
            form={form}
            onSubmit={onSubmit}
            isPending={isPending}
            title="Add Subject"
            description="Add a new subject to the central catalog."
            submitLabel="Add Subject"
            submittingLabel="Adding..."
            trigger={
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject
                </Button>
            }
        />
    );
}

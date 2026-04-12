"use client";

import { useActivePermissions } from "@sentinel/hooks";
import { Plus } from "lucide-react";
import { Button } from "@sentinel/ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@sentinel/ui";
import { Form } from "@sentinel/ui";
import { useAddSubjectForm } from "@/app/(protected)/(instructor)/subjects/_hooks/use-add-subject-form/index";
import { SubjectFormFields } from "@/app/(protected)/(instructor)/subjects/_components/forms/subject-form-fields";

export function AddSubjectDialog() {
    const { hasPermission } = useActivePermissions();
    const {
        form,
        onSubmit,
        isPending,
        open,
        setOpen,
    } = useAddSubjectForm();

    if (!hasPermission('subject_requests:request')) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Request Offered Subject
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] !duration-0 !animate-none overflow-visible">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader className="mb-4">
                            <DialogTitle>Request Offered Subject</DialogTitle>
                            <DialogDescription>
                                Select an offered subject for the active term, then choose the department, course, year level, and sections you want assigned.
                            </DialogDescription>
                        </DialogHeader>

                        <SubjectFormFields form={form} />

                        <DialogFooter className="mt-6">
                            <Button
                                type="submit"
                                disabled={isPending || form.getValues('section_ids').length === 0}
                                className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white w-full sm:w-auto"
                            >
                                Submit Request {form.watch('section_ids')?.length > 0 ? `(${form.watch('section_ids').length})` : ""}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

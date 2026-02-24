"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { useAddSubjectForm } from "@/app/(protected)/admin/subjects/_hooks/use-add-subject-form";
import { SubjectFormFields } from "@/app/(protected)/admin/subjects/_components/subject-form-fields";
import { AllocatedSectionsPicker } from "@/app/(protected)/admin/subjects/_components/allocated-sections-picker";

export function AddSubjectDialog() {
    const {
        form,
        onSubmit,
        selectedSections,
        toggleSection,
        watchedDepartment,
        open,
        setOpen,
    } = useAddSubjectForm();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Master Subject
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] !animate-none !duration-0 data-[state=open]:!animate-none data-[state=closed]:!animate-none">
                <DialogHeader>
                    <DialogTitle>Add Master Subject</DialogTitle>
                    <DialogDescription>
                        Add a new subject to the central catalog.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <SubjectFormFields form={form} />

                        <AllocatedSectionsPicker
                            watchedDepartment={watchedDepartment}
                            selectedSections={selectedSections}
                            toggleSection={toggleSection}
                        />

                        <DialogFooter>
                            <Button type="submit" className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                                Add to Catalog
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

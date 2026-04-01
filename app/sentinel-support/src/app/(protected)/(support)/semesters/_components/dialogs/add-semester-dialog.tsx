"use client";

import { useAddSemesterForm } from "@/app/(protected)/(support)/semesters/_hooks/use-add-semester-form";
import { Button } from "@sentinel/ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@sentinel/ui';
import { Form } from '@sentinel/ui';
import { Plus } from "lucide-react";
import { useState } from "react";
import { SemesterFormFields } from "@/app/(protected)/(support)/semesters/_components/dialogs/semester-form-fields";

export function AddSemesterDialog() {
    const [open, setOpen] = useState(false);
    const { form, onSubmit, isPending } = useAddSemesterForm(() => setOpen(false));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <Plus className="mr-2 h-4 w-4" /> Add Semester
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Semester</DialogTitle>
                    <DialogDescription>
                        Create a new semester/term for the institution.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <SemesterFormFields form={form} isPending={isPending} />
                        <DialogFooter>
                            <Button disabled={isPending} type="submit" className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                                {isPending ? 'Creating...' : 'Create Semester'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { type SubjectFormValues } from "@sentinel/shared/schema";
import { SubjectFormFields } from "@/app/(protected)/admin/subjects/_components/subject-form-fields";
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

interface SubjectFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<SubjectFormValues>;
    onSubmit: (values: SubjectFormValues) => void;
    isPending: boolean;
    title: string;
    description: string;
    submitLabel: string;
    submittingLabel: string;
    trigger?: ReactNode;
    showCancelButton?: boolean;
}

export function SubjectFormDialog({
    open,
    onOpenChange,
    form,
    onSubmit,
    isPending,
    title,
    description,
    submitLabel,
    submittingLabel,
    trigger,
    showCancelButton = false,
}: SubjectFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent
                className="sm:max-w-[1120px] data-[state=open]:animate-none data-[state=closed]:animate-none"
                overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <SubjectFormFields form={form} />

                        <DialogFooter>
                            {showCancelButton && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isPending}
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                            >
                                {isPending ? submittingLabel : submitLabel}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

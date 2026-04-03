"use client";

import {
    Form,
    Separator,
} from "@sentinel/ui";
import { Button } from "@sentinel/ui";
import { useExamCreateForm } from "@/features/exams/config/_hooks/use-exam-create-form";
import type { ExamCreateFormProps } from '@sentinel/shared/types';
import {
    BasicInfoFields,
    ScheduleFields,
} from "@/features/exams/_components/exam-config/_fields";

export function ExamCreateForm({ onClose }: ExamCreateFormProps) {
    const { form, onSubmit, handleClose } = useExamCreateForm(onClose);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-col">
                <div className="overflow-y-auto px-4 pb-4 pt-1">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_auto_minmax(0,0.9fr)] lg:items-start">
                        <div className="space-y-3">
                            <BasicInfoFields control={form.control} />
                        </div>
                        <Separator orientation="vertical" className="hidden h-full lg:block" />
                        <div className="space-y-3">
                            <Separator className="lg:hidden" />
                            <ScheduleFields control={form.control} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-border/60 bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">
                        This creates the draft metadata, then opens the builder so you can continue with questions.
                    </p>
                    <div className="flex justify-end items-center gap-3">
                        <Button type="button" variant="ghost" onClick={handleClose} className="font-bold text-muted-foreground">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className="h-10 bg-[#323d8f] px-6 text-white font-bold hover:bg-[#323d8f]/90"
                        >
                            {form.formState.isSubmitting ? "Creating..." : "Continue to Builder"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}

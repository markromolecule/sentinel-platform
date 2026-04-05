"use client";

import {
    Form,
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
                <div className="overflow-y-auto px-8 pb-8 pt-6">
                    <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
                        <div className="space-y-8">
                            <BasicInfoFields control={form.control} />
                        </div>
                        <div className="space-y-8">
                            <ScheduleFields control={form.control} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-border/50 bg-secondary/5 px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-medium text-muted-foreground/70 sm:max-w-[300px]">
                        This creates the draft metadata, then opens the builder so you can continue with questions.
                    </p>
                    <div className="flex justify-end items-center gap-4">
                        <Button type="button" variant="ghost" onClick={handleClose} className="font-semibold text-muted-foreground hover:bg-black/5">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className="h-11 bg-[#323d8f] px-8 text-white font-bold shadow-md hover:bg-[#323d8f]/90 hover:shadow-lg transition-all"
                        >
                            {form.formState.isSubmitting ? "Creating..." : "Continue to Builder"}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}

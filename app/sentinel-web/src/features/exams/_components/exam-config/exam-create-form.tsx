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
    SettingsFields
} from "@/features/exams/_components/exam-config/_fields";

export function ExamCreateForm({ onClose }: ExamCreateFormProps) {
    const { form, onSubmit, handleClose } = useExamCreateForm(onClose);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-2">
                <div className="space-y-6">
                    <BasicInfoFields control={form.control} />
                    <ScheduleFields control={form.control} />
                    <SettingsFields control={form.control} />
                </div>

                <div className="flex justify-end items-center gap-3 pt-6">
                    <Button type="button" variant="ghost" onClick={handleClose} className="font-bold text-muted-foreground">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white font-bold px-8 h-11"
                    >
                        {form.formState.isSubmitting ? "Creating..." : "Continue to Builder"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
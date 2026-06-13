'use client';

import { useExamCreateForm } from '@/features/exams/config/_hooks/use-exam-create-form';
import { ExamMetadataFormLayout } from '@/features/exams/_components/forms/components';
import type { ExamCreateFormProps } from '@sentinel/shared/types';
import { BasicInfoFields, ScheduleFields } from '@/features/exams/_components/forms/fields';
import { Form } from '@sentinel/ui';

export function ExamCreateForm({ onClose }: ExamCreateFormProps) {
    const { form, onSubmit, handleClose } = useExamCreateForm(onClose);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-col">
                <ExamMetadataFormLayout
                    footerNote="Draft metadata is created before opening the builder for questions."
                    isSubmitting={form.formState.isSubmitting}
                    onCancel={handleClose}
                    submitLabel="Continue to Builder"
                    submittingLabel="Creating..."
                >
                    <BasicInfoFields control={form.control} />
                    <ScheduleFields control={form.control} />
                </ExamMetadataFormLayout>
            </form>
        </Form>
    );
}

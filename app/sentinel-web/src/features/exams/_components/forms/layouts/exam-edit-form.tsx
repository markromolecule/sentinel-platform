'use client';

import { useExamEditForm } from '@/features/exams/config/_hooks/use-exam-edit-form';
import { BasicInfoFields, ScheduleFields } from '@/features/exams/_components/forms/fields';
import { ExamMetadataFormLayout } from '@/features/exams/_components/forms/components';
import type { ProctorExam } from '@sentinel/shared/types';
import { Form } from '@sentinel/ui';

interface ExamEditFormProps {
    exam: ProctorExam;
    onClose: () => void;
}

export function ExamEditForm({ exam, onClose }: ExamEditFormProps) {
    const { form, onSubmit, handleClose, isPending } = useExamEditForm(exam, onClose);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-col">
                <ExamMetadataFormLayout
                    footerNote="Question content and section structure stay in the builder. Save here when only the metadata or schedule needs to change."
                    isSubmitting={isPending}
                    onCancel={handleClose}
                    submitLabel="Save Changes"
                    submittingLabel="Saving..."
                >
                    <BasicInfoFields control={form.control} />
                    <ScheduleFields control={form.control} />
                </ExamMetadataFormLayout>
            </form>
        </Form>
    );
}

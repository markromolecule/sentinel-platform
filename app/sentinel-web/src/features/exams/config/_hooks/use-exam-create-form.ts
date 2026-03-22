import { useRouter } from 'next/navigation';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useExamStore } from '@/features/exams/builder/_stores/use-exam-store';
import { examCreateFormSchema, type ExamCreateFormValues } from '@sentinel/shared/schema';
import { EXAM_CREATE_FORM_DEFAULTS } from '@sentinel/shared/constants';

export function useExamCreateForm(onClose: () => void): {
    form: UseFormReturn<ExamCreateFormValues>;
    onSubmit: (data: ExamCreateFormValues) => Promise<void>;
    handleClose: () => void;
} {
    const router = useRouter();

    const form = useForm<ExamCreateFormValues>({
        resolver: zodResolver(examCreateFormSchema),
        defaultValues: EXAM_CREATE_FORM_DEFAULTS,
    });

    const onSubmit = async (data: ExamCreateFormValues) => {
        try {
            const fakeExamId = crypto.randomUUID();

            const store = useExamStore.getState();
            store.setExamId(fakeExamId);
            store.setTitle(data.title);
            store.setDescription(data.description || '');
            store.setQuestions([]);
            store.saveExam();

            toast.success('Draft exam created successfully!');

            // Redirect first, then close if needed, but router.push in Next.js might be delayed
            // If the dialog closes too fast, the component might unmount and cancel the push.
            // But usually onClose() is safe before push if it doesn't unmount the router context.
            router.push(`/exams/${fakeExamId}/builder`);
            onClose();
        } catch (error: unknown) {
            toast.error(
                error instanceof Error ? error.message : 'Something went wrong creating the exam.',
            );
        }
    };

    const handleClose = () => {
        form.reset();
        onClose();
    };

    return {
        form,
        onSubmit,
        handleClose,
    };
}

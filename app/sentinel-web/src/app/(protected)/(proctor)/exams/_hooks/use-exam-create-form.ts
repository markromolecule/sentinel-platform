import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useExamBuilderStore } from '@/app/(protected)/(proctor)/exams/_stores/use-exam-builder-store';
import { examCreateFormSchema, type ExamCreateFormValues } from '@sentinel/shared/schema';
import { EXAM_CREATE_FORM_DEFAULTS } from '@sentinel/shared/constants';

export function useExamCreateForm(onClose: () => void) {
    const router = useRouter();
    const { setExamMetadata } = useExamBuilderStore();

    const form = useForm<ExamCreateFormValues>({
        resolver: zodResolver(examCreateFormSchema),
        defaultValues: EXAM_CREATE_FORM_DEFAULTS,
    });

    const onSubmit = async (data: ExamCreateFormValues) => {
        try {
            const fakeExamId = crypto.randomUUID();

            setExamMetadata({
                examId: fakeExamId,
                title: data.title,
                description: data.description || '',
                durationMinutes: data.duration_minutes,
                passingScore: data.passing_score,
            });

            toast.success('Draft exam created successfully!');
            onClose();

            router.push(`/exams/${fakeExamId}/builder`);
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

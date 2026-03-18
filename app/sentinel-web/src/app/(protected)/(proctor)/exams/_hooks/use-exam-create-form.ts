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
                subjectId: data.subject_id,
                durationMinutes: data.duration_minutes,
                passingScore: data.passing_score,
            });

            toast.success('Draft exam created successfully!');
            
            // Redirect first, then close if needed, but router.push in Next.js might be delayed
            // If the dialog closes too fast, the component might unmount and cancel the push.
            // But usually onClose() is safe before push if it doesn't unmount the router context.
            router.push(`/exams/${fakeExamId}/builder?new=true&title=${encodeURIComponent(data.title)}`);
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

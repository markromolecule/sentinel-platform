import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useExamStore } from '@/features/exams/builder/_stores/use-exam-store';
import { examCreateFormSchema, type ExamCreateFormValues } from '@sentinel/shared/schema';
import { getExamCreateFormDefaults } from '@sentinel/shared/constants';
import { useSubjectStore } from '@/stores/use-subject-store';
import {
    DEFAULT_EXAM_DURATION_MINUTES,
    getDurationMinutes,
    getEndDateTimeFromDuration,
} from '@/features/exams/config/_lib/exam-schedule';

export function useExamCreateForm(onClose: () => void): {
    form: UseFormReturn<ExamCreateFormValues>;
    onSubmit: (data: ExamCreateFormValues) => Promise<void>;
    handleClose: () => void;
} {
    const router = useRouter();
    const subjects = useSubjectStore((state) => state.subjects);

    const form = useForm<ExamCreateFormValues>({
        resolver: zodResolver(examCreateFormSchema),
        defaultValues: getExamCreateFormDefaults(),
    });

    const startDateTime = useWatch({ control: form.control, name: 'startDateTime' });
    const endDateTime = useWatch({ control: form.control, name: 'endDateTime' });

    useEffect(() => {
        if (!startDateTime) {
            return;
        }

        const currentDuration = getDurationMinutes(startDateTime, endDateTime);

        if (!endDateTime || !currentDuration) {
            form.setValue(
                'endDateTime',
                getEndDateTimeFromDuration(startDateTime, DEFAULT_EXAM_DURATION_MINUTES),
                { shouldDirty: !endDateTime, shouldValidate: true },
            );
            form.setValue('durationMinutes', DEFAULT_EXAM_DURATION_MINUTES, { shouldValidate: true });
            return;
        }

        form.setValue('durationMinutes', currentDuration, { shouldValidate: true });
    }, [endDateTime, form, startDateTime]);

    const onSubmit = async (data: ExamCreateFormValues) => {
        try {
            const fakeExamId = crypto.randomUUID();
            const selectedSubject = subjects.find((subject) => subject.id === data.subjectId);

            const store = useExamStore.getState();
            store.setSetupDraft({
                examId: fakeExamId,
                title: data.title,
                description: data.description || '',
                subjectId: data.subjectId,
                subject: selectedSubject?.title || 'General Subject',
                section: data.section,
                startDateTime: data.startDateTime,
                endDateTime: data.endDateTime,
                durationMinutes: data.durationMinutes,
                passingScore: data.passingScore,
                settings: {
                    shuffleQuestions: data.shuffleQuestions,
                    showCorrectAnswers: data.showCorrectAnswers,
                    allowReview: data.allowReview,
                    randomizeChoices: data.randomizeChoices,
                },
            });
            store.setQuestions([]);
            store.saveExam();

            toast.success('Draft exam created successfully!');

            router.push(`/exams/${fakeExamId}/builder`);
            onClose();
        } catch (error: unknown) {
            toast.error(
                error instanceof Error ? error.message : 'Something went wrong creating the exam.',
            );
        }
    };

    const handleClose = () => {
        form.reset(getExamCreateFormDefaults());
        onClose();
    };

    return {
        form,
        onSubmit,
        handleClose,
    };
}

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateExamMutation } from '@sentinel/hooks';
import { examCreateFormSchema, type ExamCreateFormValues } from '@sentinel/shared/schema';
import { getExamCreateFormDefaults } from '@sentinel/shared/constants';
import {
    DEFAULT_EXAM_DURATION_MINUTES,
    getDurationMinutes,
    getEndDateTimeFromDuration,
    serializeDateTimeForApi,
} from '@/features/exams/config/_lib/exam-schedule';

export function useExamCreateForm(onClose: () => void): {
    form: UseFormReturn<ExamCreateFormValues>;
    onSubmit: (data: ExamCreateFormValues) => Promise<void>;
    handleClose: () => void;
} {
    const router = useRouter();
    const createExamMutation = useCreateExamMutation();

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
            form.setValue('durationMinutes', DEFAULT_EXAM_DURATION_MINUTES, {
                shouldValidate: true,
            });
            return;
        }

        form.setValue('durationMinutes', currentDuration, { shouldValidate: true });
    }, [endDateTime, form, startDateTime]);

    const onSubmit = async (data: ExamCreateFormValues) => {
        try {
            const startDateTime = serializeDateTimeForApi(data.startDateTime);
            const endDateTime = serializeDateTimeForApi(data.endDateTime);
            const createdExam = await createExamMutation.mutateAsync({
                title: data.title,
                description: data.description,
                subjectId: data.subjectId,
                startDateTime,
                endDateTime,
                durationMinutes: data.durationMinutes,
                passingScore: data.passingScore,
                shuffleQuestions: data.shuffleQuestions,
                showCorrectAnswers: data.showCorrectAnswers,
                allowReview: data.allowReview,
                randomizeChoices: data.randomizeChoices,
                isPublic: data.isPublic,
            });

            form.reset(getExamCreateFormDefaults());
            onClose();
        } catch (error: unknown) {
            console.error(error);
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

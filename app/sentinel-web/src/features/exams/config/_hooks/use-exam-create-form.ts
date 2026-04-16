import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateExamMutation, useEnrolledSubjectsQuery } from '@sentinel/hooks';
import { examCreateFormSchema, type ExamCreateFormValues } from '@sentinel/shared/schema';
import { getExamCreateFormDefaults } from '@sentinel/shared/constants';
import { useExamStore } from '@/features/exams/builder/_stores/use-exam-store';
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
    const createExamMutation = useCreateExamMutation();
    useEnrolledSubjectsQuery();

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
            const createdExam = await createExamMutation.mutateAsync({
                title: data.title,
                description: data.description,
                subjectId: data.subjectId,
                section: data.section,
                roomId: data.roomId,
                startDateTime: data.startDateTime,
                endDateTime: data.endDateTime,
                durationMinutes: data.durationMinutes,
                passingScore: data.passingScore,
                shuffleQuestions: data.shuffleQuestions,
                showCorrectAnswers: data.showCorrectAnswers,
                allowReview: data.allowReview,
                randomizeChoices: data.randomizeChoices,
            });

            useExamStore.getState().setSetupDraft({
                examId: createdExam.id,
                title: createdExam.title,
                description: createdExam.description || '',
                subjectId: createdExam.subjectId || data.subjectId,
                subject: createdExam.subject || 'General Subject',
                section: createdExam.section || data.section,
                startDateTime: createdExam.scheduledDate || data.startDateTime,
                endDateTime: createdExam.endDateTime || data.endDateTime,
                durationMinutes: createdExam.duration || data.durationMinutes,
                passingScore: createdExam.passingScore || data.passingScore,
                settings: createdExam.settings || {
                    shuffleQuestions: data.shuffleQuestions,
                    showCorrectAnswers: data.showCorrectAnswers,
                    allowReview: data.allowReview,
                    randomizeChoices: data.randomizeChoices,
                },
            });

            form.reset(getExamCreateFormDefaults());
            onClose();
            router.push(`/exams/${createdExam.id}/builder`);
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

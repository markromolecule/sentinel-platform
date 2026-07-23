import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateExamMutation, useExaminationConfigurationDefaultsQuery } from '@sentinel/hooks';
import { examCreateFormSchema, type ExamCreateFormValues } from '@sentinel/shared/schema';
import { getExamCreateFormDefaults } from '@sentinel/shared/constants';
import { useExamStore } from '@/features/exams/builder/_stores/use-exam-store';
import {
    DEFAULT_EXAM_DURATION_MINUTES,
    getDurationMinutes,
    getEndDateTimeFromDuration,
    serializeDateTimeForApi,
} from '@/features/exams/config/_lib/exam-schedule';

function buildInheritedCreatePayload(
    data: ExamCreateFormValues,
    dirtyFields: Partial<Record<keyof ExamCreateFormValues, unknown>>,
) {
    return {
        ...(dirtyFields.passingScore ? { passingScore: data.passingScore } : {}),
        ...(dirtyFields.shuffleQuestions ? { shuffleQuestions: data.shuffleQuestions } : {}),
        ...(dirtyFields.showCorrectAnswers ? { showCorrectAnswers: data.showCorrectAnswers } : {}),
        ...(dirtyFields.allowReview ? { allowReview: data.allowReview } : {}),
        ...(dirtyFields.randomizeChoices ? { randomizeChoices: data.randomizeChoices } : {}),
    };
}

export function useExamCreateForm(onClose: () => void): {
    form: UseFormReturn<ExamCreateFormValues>;
    onSubmit: (data: ExamCreateFormValues) => Promise<void>;
    handleClose: () => void;
} {
    const router = useRouter();
    const createExamMutation = useCreateExamMutation();
    const examinationDefaultsQuery = useExaminationConfigurationDefaultsQuery();
    const resolvedDefaults = useMemo(
        () => getExamCreateFormDefaults(examinationDefaultsQuery.data),
        [examinationDefaultsQuery.data],
    );
    const fallbackDurationMinutes =
        examinationDefaultsQuery.data?.defaultDurationMinutes ?? DEFAULT_EXAM_DURATION_MINUTES;

    const form = useForm<ExamCreateFormValues>({
        resolver: zodResolver(examCreateFormSchema),
        defaultValues: resolvedDefaults,
    });

    const startDateTime = useWatch({ control: form.control, name: 'startDateTime' });
    const endDateTime = useWatch({ control: form.control, name: 'endDateTime' });

    useEffect(() => {
        if (!examinationDefaultsQuery.data || form.formState.isDirty) {
            return;
        }

        form.reset(resolvedDefaults);
    }, [examinationDefaultsQuery.data, form, form.formState.isDirty, resolvedDefaults]);

    useEffect(() => {
        if (!startDateTime) {
            return;
        }

        const currentDuration = getDurationMinutes(startDateTime, endDateTime);

        if (!endDateTime || !currentDuration) {
            form.setValue(
                'endDateTime',
                getEndDateTimeFromDuration(startDateTime, fallbackDurationMinutes),
                { shouldDirty: !endDateTime, shouldValidate: true },
            );
            form.setValue('durationMinutes', fallbackDurationMinutes, {
                shouldValidate: true,
            });
            return;
        }

        form.setValue('durationMinutes', currentDuration, { shouldValidate: true });
    }, [endDateTime, fallbackDurationMinutes, form, startDateTime]);

    const onSubmit = async (data: ExamCreateFormValues) => {
        try {
            const startDateTime = serializeDateTimeForApi(data.startDateTime);
            const endDateTime = serializeDateTimeForApi(data.endDateTime);
            const inheritedCreatePayload = buildInheritedCreatePayload(
                data,
                form.formState.dirtyFields,
            );
            const createdExam = await createExamMutation.mutateAsync({
                title: data.title,
                description: data.description,
                subjectId: data.subjectId,
                startDateTime,
                endDateTime,
                durationMinutes: data.durationMinutes,
                isPublic: data.isPublic,
                ...inheritedCreatePayload,
            });

            useExamStore.getState().setSetupDraft({
                examId: createdExam.id,
                title: createdExam.title,
                description: createdExam.description || '',
                classroomId: null,
                classroomName: null,
                subjectId: createdExam.subjectId || data.subjectId,
                subject: createdExam.subject || 'General Subject',
                section: '',
                sectionIds: [],
                startDateTime: createdExam.scheduledDate || startDateTime,
                endDateTime: createdExam.endDateTime || endDateTime,
                durationMinutes: createdExam.duration ?? data.durationMinutes,
                passingScore: createdExam.passingScore ?? data.passingScore,
                settings: createdExam.settings || {
                    shuffleQuestions: data.shuffleQuestions,
                    showCorrectAnswers: data.showCorrectAnswers,
                    allowReview: data.allowReview,
                    randomizeChoices: data.randomizeChoices,
                },
            });

            form.reset(resolvedDefaults);
            onClose();
            router.push(`/exams/${createdExam.id}/builder`);
        } catch (error: unknown) {
            console.error(error);
        }
    };

    const handleClose = () => {
        form.reset(resolvedDefaults);
        onClose();
    };

    return {
        form,
        onSubmit,
        handleClose,
    };
}

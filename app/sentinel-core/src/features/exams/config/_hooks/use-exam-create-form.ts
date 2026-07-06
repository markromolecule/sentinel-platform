import { useEffect, useMemo } from 'react';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateExamMutation, useExaminationConfigurationDefaultsQuery } from '@sentinel/hooks';
import { examCreateFormSchema, type ExamCreateFormValues } from '@sentinel/shared/schema';
import { getExamCreateFormDefaults } from '@sentinel/shared/constants';
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
        ...(dirtyFields.showCorrectAnswers
            ? { showCorrectAnswers: data.showCorrectAnswers }
            : {}),
        ...(dirtyFields.allowReview ? { allowReview: data.allowReview } : {}),
        ...(dirtyFields.randomizeChoices ? { randomizeChoices: data.randomizeChoices } : {}),
    };
}

export function useExamCreateForm(onClose: () => void): {
    form: UseFormReturn<ExamCreateFormValues>;
    onSubmit: (data: ExamCreateFormValues) => Promise<void>;
    handleClose: () => void;
} {
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
            await createExamMutation.mutateAsync({
                title: data.title,
                description: data.description,
                subjectId: data.subjectId,
                startDateTime,
                endDateTime,
                durationMinutes: data.durationMinutes,
                isPublic: data.isPublic,
                classroomId: data.classroomIds?.[0] || undefined,
                classroomIds: data.classroomIds || undefined,
                roomId: data.roomId || undefined,
                instructorId: data.instructorId || undefined,
                instructorIds: data.instructorIds || undefined,
                ...inheritedCreatePayload,
            });

            form.reset(resolvedDefaults);
            onClose();
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

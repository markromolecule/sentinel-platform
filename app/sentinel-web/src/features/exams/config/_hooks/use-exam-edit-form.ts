import { useEffect } from 'react';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateExamMutation } from '@sentinel/hooks';
import { examCreateFormSchema, type ExamCreateFormValues } from '@sentinel/shared/schema';
import type { ProctorExam } from '@sentinel/shared/types';
import {
    DEFAULT_EXAM_DURATION_MINUTES,
    formatDateTimeLocal,
    getDurationMinutes,
    getEndDateTimeFromDuration,
} from '@/features/exams/config/_lib/exam-schedule';

function toDateTimeLocal(value?: string | null) {
    if (!value) {
        return '';
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    return formatDateTimeLocal(parsed);
}

function buildEditFormValues(exam: ProctorExam): ExamCreateFormValues {
    const startDateTime = toDateTimeLocal(exam.scheduledDate);
    const endDateTime =
        toDateTimeLocal(exam.endDateTime) ||
        (startDateTime
            ? getEndDateTimeFromDuration(
                  startDateTime,
                  exam.duration || DEFAULT_EXAM_DURATION_MINUTES,
              )
            : '');

    return {
        title: exam.title || '',
        description: exam.description || '',
        subjectId: exam.subjectId || '',
        section: exam.section || '',
        roomId: exam.roomId || undefined,
        startDateTime,
        endDateTime,
        durationMinutes:
            exam.duration ||
            getDurationMinutes(startDateTime, endDateTime) ||
            DEFAULT_EXAM_DURATION_MINUTES,
        passingScore: exam.passingScore || 75,
        shuffleQuestions: exam.settings?.shuffleQuestions ?? true,
        showCorrectAnswers: exam.settings?.showCorrectAnswers ?? false,
        allowReview: exam.settings?.allowReview ?? true,
        randomizeChoices: exam.settings?.randomizeChoices ?? true,
    };
}

export function useExamEditForm(
    exam: ProctorExam,
    onClose: () => void,
): {
    form: UseFormReturn<ExamCreateFormValues>;
    onSubmit: (data: ExamCreateFormValues) => Promise<void>;
    handleClose: () => void;
    isPending: boolean;
} {
    const updateExamMutation = useUpdateExamMutation();
    const form = useForm<ExamCreateFormValues>({
        resolver: zodResolver(examCreateFormSchema),
        defaultValues: buildEditFormValues(exam),
    });

    const startDateTime = useWatch({ control: form.control, name: 'startDateTime' });
    const endDateTime = useWatch({ control: form.control, name: 'endDateTime' });

    useEffect(() => {
        form.reset(buildEditFormValues(exam));
    }, [exam, form]);

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
        const payload: any = {
            title: data.title,
            description: data.description,
            subjectId: data.subjectId,
            section: data.section,
            roomId: data.roomId ?? null,
            startDateTime: data.startDateTime,
            endDateTime: data.endDateTime,
            durationMinutes: data.durationMinutes,
            passingScore: data.passingScore,
            shuffleQuestions: data.shuffleQuestions,
            showCorrectAnswers: data.showCorrectAnswers,
            allowReview: data.allowReview,
            randomizeChoices: data.randomizeChoices,
        };

        if (exam.status === 'archived') {
            payload.status = 'draft';
        }

        await updateExamMutation.mutateAsync({
            id: exam.id,
            payload,
        });

        onClose();
    };

    const handleClose = () => {
        form.reset(buildEditFormValues(exam));
        onClose();
    };

    return {
        form,
        onSubmit,
        handleClose,
        isPending: updateExamMutation.isPending,
    };
}

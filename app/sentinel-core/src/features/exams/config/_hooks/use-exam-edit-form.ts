import { useEffect } from 'react';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateExamMutation } from '@sentinel/hooks';
import { type UpdateExamPayload } from '@sentinel/services';
import { examCreateFormSchema, type ExamCreateFormValues } from '@sentinel/shared/schema';
import type { ProctorExam } from '@sentinel/shared/types';
import {
    DEFAULT_EXAM_DURATION_MINUTES,
    getDurationMinutes,
    getEndDateTimeFromDuration,
    serializeDateTimeForApi,
    toDateTimeLocal,
} from '@/features/exams/config/_lib/exam-schedule';

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
        classroomIds: exam.classroomIds || (exam.classroomId ? [exam.classroomId] : []),
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
        isPublic: exam.isPublic ?? false,
        instructorId: exam.assignedInstructorIds?.[0] || undefined,
        instructorIds: exam.assignedInstructorIds || [],
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
        const startDateTime = serializeDateTimeForApi(data.startDateTime);
        const endDateTime = serializeDateTimeForApi(data.endDateTime);
        const payload: UpdateExamPayload = {
            title: data.title,
            description: data.description,
            subjectId: data.subjectId,
            classroomId: data.classroomIds?.[0] || null,
            classroomIds: data.classroomIds || null,
            sectionIds: [],
            roomId: data.roomId || null,
            startDateTime,
            endDateTime,
            durationMinutes: data.durationMinutes,
            passingScore: data.passingScore,
            shuffleQuestions: data.shuffleQuestions,
            showCorrectAnswers: data.showCorrectAnswers,
            allowReview: data.allowReview,
            randomizeChoices: data.randomizeChoices,
            isPublic: data.isPublic,
            instructorId: data.instructorId || null,
            instructorIds: data.instructorIds || null,
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

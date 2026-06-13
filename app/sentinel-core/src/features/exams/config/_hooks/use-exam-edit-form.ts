import { useEffect } from 'react';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useClassroomsQuery, useUpdateExamMutation, useRoomsQuery } from '@sentinel/hooks';
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

function classroomsToSectionIds(
    classroomIds: string[],
    classrooms: Array<{ id: string; sectionId: string | null }>,
) {
    return Array.from(
        new Set(
            classrooms
                .filter((classroom) => classroomIds.includes(classroom.id))
                .map((classroom) => classroom.sectionId)
                .filter((sectionId): sectionId is string => Boolean(sectionId)),
        ),
    );
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
        classroomIds: exam.classroomId ? [exam.classroomId] : [],
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
    const { data: classrooms = [] } = useClassroomsQuery();
    const { data: rooms = [] } = useRoomsQuery();
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
        if (!exam.classroomId || classrooms.length === 0) {
            return;
        }

        const mappedClassroomIds = Array.from(
            new Set([
                exam.classroomId,
                ...classrooms
                    .filter(
                        (classroom) =>
                            classroom.subjectId === exam.subjectId &&
                            Boolean(classroom.sectionId) &&
                            (exam.sectionIds ?? []).includes(classroom.sectionId ?? ''),
                    )
                    .map((classroom) => classroom.id),
            ]),
        );

        form.setValue('classroomIds', mappedClassroomIds, {
            shouldDirty: false,
            shouldValidate: false,
        });
    }, [classrooms, exam.classroomId, exam.sectionIds, exam.subjectId, form]);

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
        if (data.roomId) {
            const selectedRoom = rooms.find((r) => r.id === data.roomId);
            if (
                selectedRoom &&
                (selectedRoom.status === 'ASSIGNED' || selectedRoom.status === 'MAINTENANCE')
            ) {
                form.setError('roomId', {
                    type: 'manual',
                    message: `The selected room is ${selectedRoom.status.toLowerCase()} and cannot be reserved.`,
                });
                return;
            }
        }
        const selectedSectionIds = classroomsToSectionIds(data.classroomIds, classrooms);
        const startDateTime = serializeDateTimeForApi(data.startDateTime);
        const endDateTime = serializeDateTimeForApi(data.endDateTime);
        const payload: UpdateExamPayload = {
            title: data.title,
            description: data.description,
            classroomId: data.classroomIds[0],
            sectionIds: selectedSectionIds,
            roomId: data.roomId ?? null,
            startDateTime,
            endDateTime,
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

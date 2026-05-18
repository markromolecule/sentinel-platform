import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useClassroomsQuery, useCreateExamMutation, useRoomsQuery } from '@sentinel/hooks';
import { examCreateFormSchema, type ExamCreateFormValues } from '@sentinel/shared/schema';
import { getExamCreateFormDefaults } from '@sentinel/shared/constants';
import { useExamStore } from '@/features/exams/builder/_stores/use-exam-store';
import {
    DEFAULT_EXAM_DURATION_MINUTES,
    getDurationMinutes,
    getEndDateTimeFromDuration,
    serializeDateTimeForApi,
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

export function useExamCreateForm(onClose: () => void): {
    form: UseFormReturn<ExamCreateFormValues>;
    onSubmit: (data: ExamCreateFormValues) => Promise<void>;
    handleClose: () => void;
} {
    const router = useRouter();
    const createExamMutation = useCreateExamMutation();
    const { data: classrooms = [] } = useClassroomsQuery();
    const { data: rooms = [] } = useRoomsQuery();

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
        try {
            const selectedSectionIds = classroomsToSectionIds(data.classroomIds, classrooms);
            const startDateTime = serializeDateTimeForApi(data.startDateTime);
            const endDateTime = serializeDateTimeForApi(data.endDateTime);
            const createdExam = await createExamMutation.mutateAsync({
                title: data.title,
                description: data.description,
                classroomId: data.classroomIds[0],
                sectionIds: selectedSectionIds,
                roomId: data.roomId,
                startDateTime,
                endDateTime,
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
                classroomId: createdExam.classroomId || data.classroomIds[0],
                classroomName: createdExam.classroomName || 'Classroom',
                subjectId: createdExam.subjectId || '',
                subject: createdExam.subject || 'General Subject',
                section: createdExam.section || '',
                sectionIds: createdExam.sectionIds || [],
                startDateTime: createdExam.scheduledDate || startDateTime,
                endDateTime: createdExam.endDateTime || endDateTime,
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

import { useEffect, useMemo } from 'react';
import { useClassroomsQuery, useRoomsQuery } from '@sentinel/hooks';
import type { ExamCreateFormValues } from '@sentinel/shared/schema';
import type { Room } from '@sentinel/shared/types';
import { useFormContext, useWatch } from 'react-hook-form';
import type { ExamClassroomOption } from '@/features/exams/config/_lib/classroom-options';
import { mapClassroomsToExamOptions } from '@/features/exams/config/_lib/classroom-options';
import type { ExamFormFieldProps } from '../_types';

export type BasicInfoFieldState = {
    classroomId?: string;
    classroomOptions: ExamClassroomOption[];
    isRoomsLoading: boolean;
    isClassroomsLoading: boolean;
    rooms: Room[];
    selectedRoom?: Room;
    selectedClassroom?: ExamClassroomOption;
};

export function useBasicInfoFieldState(
    control: ExamFormFieldProps['control'],
): BasicInfoFieldState {
    const { data: classrooms = [], isLoading: isClassroomsLoading } = useClassroomsQuery();
    const { data: rooms = [], isLoading: isRoomsLoading } = useRoomsQuery();
    const { setValue } = useFormContext<ExamCreateFormValues>();

    const classroomId = useWatch({ control, name: 'classroomId' });
    const roomId = useWatch({ control, name: 'roomId' });

    const classroomOptions = useMemo(() => mapClassroomsToExamOptions(classrooms), [classrooms]);
    const selectedClassroom = useMemo(
        () => classroomOptions.find((classroom) => classroom.id === classroomId),
        [classroomId, classroomOptions],
    );
    const selectedRoom = useMemo(() => rooms.find((room) => room.id === roomId), [roomId, rooms]);

    useEffect(() => {
        if (isClassroomsLoading || !classroomId) {
            return;
        }

        const isStillValid = classroomOptions.some((classroom) => classroom.id === classroomId);

        if (!isStillValid) {
            setValue('classroomId', '', { shouldDirty: true, shouldValidate: true });
        }
    }, [classroomId, classroomOptions, isClassroomsLoading, setValue]);

    return {
        classroomId,
        classroomOptions,
        isRoomsLoading,
        isClassroomsLoading,
        rooms,
        selectedRoom,
        selectedClassroom,
    };
}

import { useEffect, useMemo } from 'react';
import { useClassroomsQuery, useRoomsQuery } from '@sentinel/hooks';
import type { ExamCreateFormValues } from '@sentinel/shared/schema';
import type { Room } from '@sentinel/shared/types';
import { useFormContext, useWatch } from 'react-hook-form';
import type { ExamClassroomOption } from '@/features/exams/config/_lib/classroom-options';
import { mapClassroomsToExamOptions } from '@/features/exams/config/_lib/classroom-options';
import type { ExamFormFieldProps } from '../_types';

export type BasicInfoFieldState = {
    classroomIds: string[];
    classroomOptions: ExamClassroomOption[];
    isRoomsLoading: boolean;
    isClassroomsLoading: boolean;
    rooms: Room[];
    selectedRoom?: Room;
    selectedClassrooms: ExamClassroomOption[];
};

export function useBasicInfoFieldState(
    control: ExamFormFieldProps['control'],
): BasicInfoFieldState {
    const { data: classrooms = [], isLoading: isClassroomsLoading } = useClassroomsQuery();
    const { data: rooms = [], isLoading: isRoomsLoading } = useRoomsQuery();
    const { setValue } = useFormContext<ExamCreateFormValues>();

    const classroomIds = useWatch({ control, name: 'classroomIds' }) ?? [];
    const roomId = useWatch({ control, name: 'roomId' });

    const classroomOptions = useMemo(() => mapClassroomsToExamOptions(classrooms), [classrooms]);
    const selectedClassrooms = useMemo(
        () =>
            classroomOptions
                .filter((classroom) => classroomIds.includes(classroom.id))
                .sort(
                    (left, right) => classroomIds.indexOf(left.id) - classroomIds.indexOf(right.id),
                ),
        [classroomIds, classroomOptions],
    );
    const selectedRoom = useMemo(() => rooms.find((room) => room.id === roomId), [roomId, rooms]);

    useEffect(() => {
        if (isClassroomsLoading || classroomIds.length === 0) {
            return;
        }

        const nextClassroomIds = classroomIds.filter((classroomId) =>
            classroomOptions.some((classroom) => classroom.id === classroomId),
        );

        if (nextClassroomIds.length !== classroomIds.length) {
            setValue('classroomIds', nextClassroomIds, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [classroomIds, classroomOptions, isClassroomsLoading, setValue]);

    return {
        classroomIds,
        classroomOptions,
        isRoomsLoading,
        isClassroomsLoading,
        rooms,
        selectedRoom,
        selectedClassrooms,
    };
}

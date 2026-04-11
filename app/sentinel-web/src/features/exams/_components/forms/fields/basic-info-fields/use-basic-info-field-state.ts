import { useEffect, useMemo } from 'react';
import { useEnrolledSubjectsQuery, useRoomsQuery } from '@sentinel/hooks';
import type { ExamCreateFormValues } from '@sentinel/shared/schema';
import type { Room } from '@sentinel/shared/types';
import { useFormContext, useWatch } from 'react-hook-form';
import type {
    ExamSectionOption,
    ExamSubjectOption,
} from '@/features/exams/config/_lib/enrolled-subject-options';
import { mapEnrolledSubjectsToExamOptions } from '@/features/exams/config/_lib/enrolled-subject-options';
import type { ExamFormFieldProps } from '../_types';

const EMPTY_SECTIONS: ExamSectionOption[] = [];

export type BasicInfoFieldState = {
    availableSections: ExamSectionOption[];
    isRoomsLoading: boolean;
    isSubjectsLoading: boolean;
    rooms: Room[];
    selectedRoom?: Room;
    subjectId?: string;
    subjectOptions: ExamSubjectOption[];
};

export function useBasicInfoFieldState(
    control: ExamFormFieldProps['control'],
): BasicInfoFieldState {
    const { data: enrolledSubjects = [], isLoading: isSubjectsLoading } =
        useEnrolledSubjectsQuery();
    const { data: rooms = [], isLoading: isRoomsLoading } = useRoomsQuery();
    const { setValue } = useFormContext<ExamCreateFormValues>();

    const subjectId = useWatch({ control, name: 'subjectId' });
    const section = useWatch({ control, name: 'section' });
    const roomId = useWatch({ control, name: 'roomId' });

    const subjectOptions = useMemo(
        () => mapEnrolledSubjectsToExamOptions(enrolledSubjects),
        [enrolledSubjects],
    );
    const selectedSubject = useMemo(
        () => subjectOptions.find((subject) => subject.id === subjectId),
        [subjectId, subjectOptions],
    );
    const availableSections = selectedSubject?.sections ?? EMPTY_SECTIONS;
    const hasValidSelectedSection = useMemo(
        () => !section || availableSections.some((item) => item.name === section),
        [availableSections, section],
    );
    const selectedRoom = useMemo(() => rooms.find((room) => room.id === roomId), [roomId, rooms]);

    useEffect(() => {
        if (isSubjectsLoading || !subjectId || !section || hasValidSelectedSection) {
            return;
        }

        setValue('section', '', { shouldDirty: true, shouldValidate: true });
    }, [hasValidSelectedSection, isSubjectsLoading, section, setValue, subjectId]);

    return {
        availableSections,
        isRoomsLoading,
        isSubjectsLoading,
        rooms,
        selectedRoom,
        subjectId,
        subjectOptions,
    };
}

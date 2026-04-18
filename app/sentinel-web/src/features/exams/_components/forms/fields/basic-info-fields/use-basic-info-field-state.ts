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
    const watchSectionIds = useWatch({ control, name: 'sectionIds' });
    const sectionIds = useMemo(() => watchSectionIds || [], [watchSectionIds]);
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
    const hasInvalidSelectedSections = useMemo(
        () => sectionIds.some((id) => !availableSections.some((item) => item.id === id)),
        [availableSections, sectionIds],
    );
    const selectedRoom = useMemo(() => rooms.find((room) => room.id === roomId), [roomId, rooms]);

    useEffect(() => {
        if (
            isSubjectsLoading ||
            !subjectId ||
            sectionIds.length === 0 ||
            !hasInvalidSelectedSections
        ) {
            return;
        }

        const validSectionIds = sectionIds.filter((id) =>
            availableSections.some((item) => item.id === id),
        );

        setValue('sectionIds', validSectionIds, { shouldDirty: true, shouldValidate: true });
    }, [
        availableSections,
        hasInvalidSelectedSections,
        isSubjectsLoading,
        sectionIds,
        setValue,
        subjectId,
    ]);

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

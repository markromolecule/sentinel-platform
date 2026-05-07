'use client';

import { useState } from 'react';
import type { ExamFormFieldProps } from './_types';
import { ExamFormSection } from '@/features/exams/_components/forms/components';
import { BasicDetailsFields } from './basic-info-fields/basic-details-fields';
import { RoomField } from './basic-info-fields/room-field';
import { ClassroomField } from './basic-info-fields/classroom-field';
import { useBasicInfoFieldState } from './basic-info-fields/use-basic-info-field-state';

type BasicInfoFieldsProps = ExamFormFieldProps & {
    currentExamId?: string;
};

export function BasicInfoFields({ control, currentExamId }: BasicInfoFieldsProps) {
    const [roomOpen, setRoomOpen] = useState(false);
    const {
        classroomIds,
        classroomOptions,
        isRoomsLoading,
        isClassroomsLoading,
        isRoomsAvailabilityLoading,
        roomGroups,
        selectedRoomOption,
    } = useBasicInfoFieldState(control, currentExamId);

    return (
        <ExamFormSection title="General Info" description="Core details for your exam session.">
            <div className="grid gap-4">
                <BasicDetailsFields control={control} />
                <ClassroomField
                    control={control}
                    classroomIds={classroomIds}
                    classroomOptions={classroomOptions}
                    isClassroomsLoading={isClassroomsLoading}
                />
                <RoomField
                    control={control}
                    isOpen={roomOpen}
                    isRoomsLoading={isRoomsLoading}
                    isRoomsAvailabilityLoading={isRoomsAvailabilityLoading}
                    onOpenChange={setRoomOpen}
                    roomGroups={roomGroups}
                    selectedRoomOption={selectedRoomOption}
                />
            </div>
        </ExamFormSection>
    );
}

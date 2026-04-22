'use client';

import { useState } from 'react';
import type { ExamFormFieldProps } from './_types';
import { ExamFormSection } from '@/features/exams/_components/forms/components';
import { BasicDetailsFields } from './basic-info-fields/basic-details-fields';
import { RoomField } from './basic-info-fields/room-field';
import { ClassroomField } from './basic-info-fields/classroom-field';
import { useBasicInfoFieldState } from './basic-info-fields/use-basic-info-field-state';

export function BasicInfoFields({ control }: ExamFormFieldProps) {
    const [roomOpen, setRoomOpen] = useState(false);
    const {
        classroomIds,
        classroomOptions,
        isRoomsLoading,
        isClassroomsLoading,
        rooms,
        selectedRoom,
    } = useBasicInfoFieldState(control);

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
                    onOpenChange={setRoomOpen}
                    rooms={rooms}
                    selectedRoom={selectedRoom}
                />
            </div>
        </ExamFormSection>
    );
}

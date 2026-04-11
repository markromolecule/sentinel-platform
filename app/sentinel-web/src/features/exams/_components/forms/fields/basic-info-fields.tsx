'use client';

import { useState } from 'react';
import type { ExamFormFieldProps } from './_types';
import { ExamFormSection } from '@/features/exams/_components/forms/components';
import { BasicDetailsFields } from './basic-info-fields/basic-details-fields';
import { RoomField } from './basic-info-fields/room-field';
import { SubjectSectionFields } from './basic-info-fields/subject-section-fields';
import { useBasicInfoFieldState } from './basic-info-fields/use-basic-info-field-state';

export function BasicInfoFields({ control }: ExamFormFieldProps) {
    const [roomOpen, setRoomOpen] = useState(false);
    const {
        availableSections,
        isRoomsLoading,
        isSubjectsLoading,
        rooms,
        selectedRoom,
        subjectId,
        subjectOptions,
    } = useBasicInfoFieldState(control);

    return (
        <ExamFormSection
            title="General Info"
            description="Core details for your exam session."
        >
            <div className="grid gap-6">
                <BasicDetailsFields control={control} />
                <SubjectSectionFields
                    control={control}
                    availableSections={availableSections}
                    isSubjectsLoading={isSubjectsLoading}
                    subjectId={subjectId}
                    subjectOptions={subjectOptions}
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

            <p className="text-muted-foreground/60 text-[11px] italic leading-relaxed">
                * Available items are based on your approved institution enrollments.
            </p>
        </ExamFormSection>
    );
}

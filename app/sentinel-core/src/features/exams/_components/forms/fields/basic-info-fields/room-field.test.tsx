import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import type { ExamCreateFormValues } from '@sentinel/shared/schema';
import type { Room } from '@sentinel/shared/types';
import { RoomField } from './room-field';
import { buildRoomOptionGroups } from './room-field.utils';

class ResizeObserverMock {
    observe() { }
    unobserve() { }
    disconnect() { }
}

window.HTMLElement.prototype.scrollIntoView = () => undefined;

const rooms: Room[] = [
    {
        id: 'room-lecture-1',
        name: 'Main Hall',
        code: 'MH-101',
        room_number: '101',
        room_type: 'LECTURE',
    },
    {
        id: 'room-lab-1',
        name: 'Chemistry Lab',
        code: 'LAB-1',
        room_number: '201',
        room_type: 'LABORATORY',
    },
];

const defaultValues: ExamCreateFormValues = {
    title: 'Midterm Exam',
    description: 'Scheduled exam',
    subjectId: '',
    classroomIds: [],
    roomId: undefined,
    startDateTime: '2026-05-08T10:00',
    endDateTime: '2026-05-08T12:00',
    durationMinutes: 120,
    passingScore: 75,
    shuffleQuestions: false,
    showCorrectAnswers: false,
    allowReview: false,
    randomizeChoices: false,
};

describe('RoomField', () => {
    globalThis.ResizeObserver = ResizeObserverMock as typeof ResizeObserver;

    it('filters room options and stores the selected room id', () => {
        let formRef: UseFormReturn<ExamCreateFormValues> | undefined;

        function Harness() {
            const form = useForm<ExamCreateFormValues>({
                defaultValues,
            });
            formRef = form;

            const roomGroups = buildRoomOptionGroups({
                rooms,
                exams: [],
            });

            return (
                <FormProvider {...form}>
                    <RoomField
                        control={form.control}
                        isOpen
                        isRoomsLoading={false}
                        isRoomsAvailabilityLoading={false}
                        onOpenChange={() => undefined}
                        roomGroups={roomGroups}
                    />
                </FormProvider>
            );
        }

        render(<Harness />);

        fireEvent.change(screen.getByPlaceholderText(/search by room name/i), {
            target: { value: 'chemistry' },
        });

        fireEvent.click(screen.getByText('Chemistry Lab'));

        expect(formRef?.getValues('roomId')).toBe('room-lab-1');
        expect(screen.queryByText('Main Hall')).toBeNull();
    });

    it('renders unavailable conflict context for overlapping rooms', () => {
        function Harness() {
            const form = useForm<ExamCreateFormValues>({
                defaultValues: {
                    ...defaultValues,
                    roomId: 'room-lecture-1',
                },
            });

            const roomGroups = buildRoomOptionGroups({
                rooms,
                exams: [
                    {
                        id: 'exam-1',
                        title: 'Physics Midterm',
                        roomId: 'room-lecture-1',
                        scheduledDate: '2026-05-08T10:30:00',
                        endDateTime: '2026-05-08T11:30:00',
                    },
                ],
                startDateTime: '2026-05-08T10:00',
                endDateTime: '2026-05-08T12:00',
            });

            const selectedRoomOption = roomGroups
                .flatMap((group) => group.options)
                .find((option) => option.room.id === 'room-lecture-1');

            return (
                <FormProvider {...form}>
                    <RoomField
                        control={form.control}
                        isOpen
                        isRoomsLoading={false}
                        isRoomsAvailabilityLoading={false}
                        onOpenChange={() => undefined}
                        roomGroups={roomGroups}
                        selectedRoomOption={selectedRoomOption}
                    />
                </FormProvider>
            );
        }

        render(<Harness />);

        expect(screen.getAllByText(/unavailable/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/busy for physics midterm/i)).toBeTruthy();
        expect(screen.getByText(/this room overlaps with physics midterm/i)).toBeTruthy();
    });
});

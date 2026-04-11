'use client';

import { useCreateRoomMutation } from '@sentinel/hooks';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { roomSchema, type RoomFormValues } from '@sentinel/shared/schema';
import { toast } from 'sonner';

export function useAddRoomForm(onSuccess: () => void) {
    const form = useForm<RoomFormValues>({
        resolver: zodResolver(roomSchema) as Resolver<RoomFormValues>,
        defaultValues: {
            institution_id: '',
            name: 'ROOM',
            code: 'RM',
            room_type: 'LECTURE',
        },
    });

    const createRoom = useCreateRoomMutation({
        onSuccess: () => {
            form.reset();
            onSuccess();
        },
        onError: (error: Error) => {
            const message = error.message || 'Failed to create room.';
            const isDuplicateName = message
                .toLowerCase()
                .includes('room already exists with this name');

            if (isDuplicateName) {
                form.setError('name', {
                    type: 'server',
                    message: 'A room with this name already exists for the selected institution.',
                });
                return;
            }

            toast.error(message);
        },
    });

    function onSubmit(values: RoomFormValues) {
        if (!values.institution_id) {
            form.setError('institution_id', {
                type: 'manual',
                message: 'Institution is required',
            });
            return;
        }

        createRoom.mutate(values);
    }

    return {
        form,
        onSubmit,
        isPending: createRoom.isPending,
    };
}

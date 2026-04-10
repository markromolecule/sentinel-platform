'use client';

import { useUpdateRoomMutation } from '@sentinel/hooks';
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { roomSchema, type RoomFormValues } from '@sentinel/shared/schema';
import { Room } from '@sentinel/shared/types';

export function useEditRoomForm(room: Room, onSuccess: () => void) {
    const updateRoom = useUpdateRoomMutation({
        onSuccess: () => {
            form.reset();
            onSuccess();
        },
    });

    const ensurePrefix = (val: string | null | undefined, prefix: string) => {
        if (!val) return prefix;
        return val.startsWith(prefix) ? val : `${prefix}${val}`;
    };

    // Form instance
    const form = useForm<RoomFormValues>({
        resolver: zodResolver(roomSchema) as Resolver<RoomFormValues>,
        defaultValues: {
            institution_id: room.institutionId ?? '',
            name: ensurePrefix(room.name, '[ROOM] '),
            code: ensurePrefix(room.code, '[RM] '),
            room_type: room.room_type,
        },
    });

    // Reset when the room changes
    useEffect(() => {
        form.reset({
            institution_id: room.institutionId ?? '',
            name: ensurePrefix(room.name, '[ROOM] '),
            code: ensurePrefix(room.code, '[RM] '),
            room_type: room.room_type,
        });
    }, [room, form]);

    // Submit handler
    function onSubmit(values: RoomFormValues) {
        if (!values.institution_id) {
            form.setError('institution_id', {
                type: 'manual',
                message: 'Institution is required',
            });
            return;
        }

        updateRoom.mutate({
            id: room.id,
            payload: values,
        });
    }

    return {
        form,
        onSubmit,
        isPending: updateRoom.isPending,
    };
}

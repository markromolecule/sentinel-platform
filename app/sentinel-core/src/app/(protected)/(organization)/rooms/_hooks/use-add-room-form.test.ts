import { describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAddRoomForm } from './use-add-room-form';
import { useCreateRoomMutation } from '@sentinel/hooks';

vi.mock('@sentinel/hooks', () => ({
    useCreateRoomMutation: vi.fn().mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
    }),
    notifyPermissionDenied: vi.fn(),
}));

describe('useAddRoomForm', () => {
    it('initializes with default values including status AVAILABLE', () => {
        const onSuccess = vi.fn();
        const { result } = renderHook(() => useAddRoomForm(onSuccess));

        expect(result.current.form.getValues()).toEqual({
            institution_id: '',
            name: 'ROOM',
            code: 'RM',
            room_number: '',
            room_type: 'LECTURE',
            status: 'AVAILABLE',
        });
    });

    it('submits form values including status AVAILABLE', async () => {
        const onSuccess = vi.fn();
        const mockMutate = vi.fn();
        vi.mocked(useCreateRoomMutation).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        } as any);

        const { result } = renderHook(() => useAddRoomForm(onSuccess));

        // Fill form fields
        act(() => {
            result.current.form.setValue('institution_id', 'inst-123');
            result.current.form.setValue('name', 'Room 101');
            result.current.form.setValue('room_number', '101');
            result.current.form.setValue('room_type', 'LECTURE');
            result.current.form.setValue('status', 'AVAILABLE');
        });

        // Submit form
        act(() => {
            result.current.onSubmit(result.current.form.getValues());
        });

        expect(mockMutate).toHaveBeenCalledWith({
            institution_id: 'inst-123',
            name: 'Room 101',
            code: 'RM', // default or prefilled
            room_number: '101',
            room_type: 'LECTURE',
            status: 'AVAILABLE',
        });
    });

    it('submits custom status like MAINTENANCE', async () => {
        const onSuccess = vi.fn();
        const mockMutate = vi.fn();
        vi.mocked(useCreateRoomMutation).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        } as any);

        const { result } = renderHook(() => useAddRoomForm(onSuccess));

        // Fill form fields
        act(() => {
            result.current.form.setValue('institution_id', 'inst-123');
            result.current.form.setValue('name', 'Room 102');
            result.current.form.setValue('room_number', '102');
            result.current.form.setValue('room_type', 'LABORATORY');
            result.current.form.setValue('status', 'MAINTENANCE');
        });

        // Submit form
        act(() => {
            result.current.onSubmit(result.current.form.getValues());
        });

        expect(mockMutate).toHaveBeenCalledWith({
            institution_id: 'inst-123',
            name: 'Room 102',
            code: 'RM',
            room_number: '102',
            room_type: 'LABORATORY',
            status: 'MAINTENANCE',
        });
    });
});

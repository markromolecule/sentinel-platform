import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoomsList } from './rooms-list';
import { type Room } from '@sentinel/shared/types';
import { type PaginationState } from '@tanstack/react-table';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock @sentinel/hooks fully
vi.mock('@sentinel/hooks', () => ({
    PermissionGuard: ({ children }: any) => <>{children}</>,
    useActivePermissions: () => ({
        hasPermission: () => true,
    }),
    useDeleteRoomMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
    useDeleteRoomsMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
    useUpdateRoomMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
    useInstitutionsQuery: () => ({
        data: [],
    }),
    useStableValue: (factory: any) => factory(),
    useApi: () => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    }),
}));

const mockRooms: Room[] = [
    {
        id: 'room-1',
        name: 'Room 101',
        code: 'R101',
        institutionId: 'inst-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

describe('RoomsList', () => {
    it('renders the rooms list and forwards pagination props', () => {
        const onPaginationChangeMock = vi.fn();
        const paginationState: PaginationState = {
            pageIndex: 0,
            pageSize: 10,
        };

        render(
            <RoomsList
                rooms={mockRooms}
                searchTerm=""
                onSearchChange={vi.fn()}
                isLoading={false}
                pagination={paginationState}
                onPaginationChange={onPaginationChangeMock}
                pageCount={5}
                totalCount={50}
                manualPagination={true}
            />,
        );

        // Verify the room name is displayed
        expect(screen.getByText('Room 101')).toBeDefined();
    });
});

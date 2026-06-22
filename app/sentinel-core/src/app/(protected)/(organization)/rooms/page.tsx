'use client';

import {
    useDebounce,
    useRoomsQuery,
    isPermissionDeniedError,
    useServerPagination,
} from '@sentinel/hooks';
import { useState } from 'react';
import { AddRoomDialog, BulkRoomUploadDialog, RoomsList } from './_components';
import { PermissionDeniedState } from '@sentinel/ui';
import { OrganizationPageShell } from '../_components/layout';

export default function SupportRoomsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const { pagination, setPagination } = useServerPagination([debouncedSearch]);

    const {
        data: roomsResponse,
        isLoading,
        isError,
        error,
    } = useRoomsQuery({
        search: debouncedSearch,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
    });
    const isViewDenied = isPermissionDeniedError(error, 'rooms:view');
    const rooms = Array.isArray(roomsResponse) ? roomsResponse : (roomsResponse?.items ?? []);
    const totalCount = Array.isArray(roomsResponse)
        ? roomsResponse.length
        : (roomsResponse?.pagination?.total ?? 0);
    const pageCount = Array.isArray(roomsResponse)
        ? 1
        : (roomsResponse?.pagination?.totalPages ?? 1);

    const actions = !isViewDenied ? (
        <div className="flex items-center gap-2">
            <AddRoomDialog />
            <BulkRoomUploadDialog />
        </div>
    ) : undefined;

    return (
        <OrganizationPageShell
            title="Room Management"
            description="Manage rooms and venues for examinations."
            actions={actions}
        >
            {isViewDenied ? (
                <PermissionDeniedState resourceName="rooms" className="h-[360px]" />
            ) : (
                <div className="relative">
                    <RoomsList
                        rooms={rooms}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        isLoading={isLoading}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        pageCount={pageCount}
                        totalCount={totalCount}
                        manualPagination
                    />

                    {isLoading && rooms.length === 0 && (
                        <div className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 z-10 flex items-center justify-center rounded-md">
                            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                        </div>
                    )}

                    {isError && (
                        <div className="text-destructive bg-destructive/5 border-destructive/20 mt-4 flex h-32 items-center justify-center rounded-md border">
                            Error loading rooms. Contact support if this continues.
                        </div>
                    )}
                </div>
            )}
        </OrganizationPageShell>
    );
}

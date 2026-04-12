'use client';

import { useDebounce, useRoomsQuery, isPermissionDeniedError } from '@sentinel/hooks';
import { useState } from 'react';
import { AddRoomDialog, RoomsList } from '@/app/(protected)/(support)/rooms/_components';
import { PageHeader, PermissionDeniedState, Separator } from '@sentinel/ui';

export default function SupportRoomsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data: rooms = [], isLoading, isError, error } = useRoomsQuery(debouncedSearch);
    const isViewDenied = isPermissionDeniedError(error, 'rooms:view');

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Room Management"
                description="Manage rooms and venues for examinations."
            >
                {!isViewDenied ? <AddRoomDialog /> : null}
            </PageHeader>
            <Separator />

            {isViewDenied ? (
                <PermissionDeniedState resourceName="rooms" className="h-[360px]" />
            ) : (
                <div className="relative">
                    <RoomsList
                        rooms={rooms}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        isLoading={isLoading}
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
        </div>
    );
}

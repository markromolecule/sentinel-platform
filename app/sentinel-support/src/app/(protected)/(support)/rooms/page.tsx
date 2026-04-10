"use client";

import { useDebounce, useRoomsQuery } from "@sentinel/hooks";
import { useState } from "react";
import { AddRoomDialog, RoomsList } from "@/app/(protected)/(support)/rooms/_components";
import { PageHeader, Separator } from "@sentinel/ui";

export default function SupportRoomsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // get rooms from the api
    const { data: rooms = [], isLoading, isError } = useRoomsQuery(debouncedSearch);

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Room Management"
                description="Manage rooms and venues for examinations."
            >
                <AddRoomDialog />
            </PageHeader>
            <Separator />

            <div className="relative">
                <RoomsList
                    rooms={rooms}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    isLoading={isLoading}
                />

                {isLoading && rooms.length === 0 && (
                    <div className="absolute inset-x-0 bottom-0 top-[60px] flex items-center justify-center bg-background/80 z-10 rounded-md">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                )}

                {isError && (
                    <div className="mt-4 flex h-32 items-center justify-center text-destructive bg-destructive/5 rounded-md border border-destructive/20">
                        Error loading rooms. Please try again.
                    </div>
                )}
            </div>
        </div>
    );
}

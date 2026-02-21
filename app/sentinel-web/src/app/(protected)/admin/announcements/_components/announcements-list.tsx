"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "./columns";
import { Announcement } from '@sentinel/shared/types';;

interface AnnouncementsListProps {
    announcements: Announcement[];
}

export function AnnouncementsList({ announcements }: AnnouncementsListProps) {
    return (
        <DataTable
            columns={columns}
            data={announcements}
            searchKey="title"
            searchPlaceholder="Search announcements..."
        />
    );
}

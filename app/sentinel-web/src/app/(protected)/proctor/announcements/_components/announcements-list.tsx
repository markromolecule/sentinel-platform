"use client";

import { DataTable } from "@/components/ui/data-table/data-table";
import { Announcement } from "@sentinel/shared/types";
import { columns } from "@/app/(protected)/proctor/announcements/_components/columns";

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

"use client";

import { DataTable } from "@sentinel/ui";
import { Announcement } from "@sentinel/shared/types";
import { columns } from "@/app/(protected)/(instructor)/announcements/_components/columns";

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

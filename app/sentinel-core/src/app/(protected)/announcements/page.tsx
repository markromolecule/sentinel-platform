"use client";

import { Separator } from "@sentinel/ui";
import { AnnouncementsList } from "@/app/(protected)/announcements/_components/announcements-list";
import { AddAnnouncementDialog } from "@/app/(protected)/announcements/_components/add-announcement-dialog";
import { PageHeader } from "@/components/common";
import { MOCK_ANNOUNCEMENTS } from '@sentinel/shared/constants';

export default function AnnouncementsPage() {
    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Announcements"
                description="Manage system-wide announcements and notifications."
            >
                <AddAnnouncementDialog />
            </PageHeader>

            <Separator />

            <AnnouncementsList announcements={MOCK_ANNOUNCEMENTS} />
        </div>
    );
}

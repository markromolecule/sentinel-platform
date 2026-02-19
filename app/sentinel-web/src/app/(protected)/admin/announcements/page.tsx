"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AnnouncementsList } from "@/app/(protected)/admin/announcements/_components/announcements-list";
import { MOCK_ANNOUNCEMENTS } from "@/app/(protected)/admin/_constants";
import { AddAnnouncementDialog } from "@/app/(protected)/admin/announcements/_components/add-announcement-dialog";
import { PageHeader } from "@/components/common";

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

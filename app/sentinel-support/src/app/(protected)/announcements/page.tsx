import { Separator } from '@sentinel/ui';
import { AddAnnouncementDialog } from './_components/add-announcement-dialog';
import { AnnouncementsContainer } from './_components/announcements-container';
import { PageHeader } from '@sentinel/ui';

export default function AnnouncementsPage() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Announcements"
                description="Manage system-wide announcements and notifications."
            >
                <AddAnnouncementDialog />
            </PageHeader>

            <Separator />

            <AnnouncementsContainer />
        </div>
    );
}


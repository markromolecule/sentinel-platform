import { Plus } from 'lucide-react';
import { Button } from '@sentinel/ui';
import { Separator } from '@sentinel/ui';
import { AnnouncementsList } from '@/app/(protected)/(instructor)/announcements/_components/announcements-list';
import { MOCK_ANNOUNCEMENTS } from '@sentinel/shared/constants';

export default function AnnouncementsPage() {
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-muted-foreground">
                        Stay updated with the latest news and system notifications.
                    </p>
                </div>
                <Button className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Post Announcement
                </Button>
            </div>

            <Separator />

            <AnnouncementsList announcements={MOCK_ANNOUNCEMENTS} />
        </div>
    );
}

import { Separator } from '@sentinel/ui';
import { AnnouncementsContainer } from './_components/announcements-container';

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
            </div>

            <Separator />

            <AnnouncementsContainer />
        </div>
    );
}


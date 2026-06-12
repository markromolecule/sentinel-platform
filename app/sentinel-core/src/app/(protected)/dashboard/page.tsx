'use client';

import { DashboardShell, DashboardGreeting } from '@/app/(protected)/dashboard/_components';
import { Separator, LoadingState } from '@sentinel/ui';
import { useUser } from '@/hooks/use-user';
import { useProfileQuery } from '@sentinel/hooks';

export default function DashboardPage() {
    const { data: user, isLoading: isUserLoading } = useUser();
    const { profile, isLoading: isProfileLoading } = useProfileQuery();

    if (isUserLoading || isProfileLoading) {
        return <LoadingState message="Loading dashboard..." className="flex-1" />;
    }

    const profileName = profile
        ? [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
        : '';
    const displayName =
        profileName ||
        (user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? 'there');

    return (
        <DashboardShell>
            <DashboardGreeting fullName={displayName} />
            <Separator className="my-6" />
            <div className="space-y-4"></div>
        </DashboardShell>
    );
}

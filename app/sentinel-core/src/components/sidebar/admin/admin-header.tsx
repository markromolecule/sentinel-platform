'use client';

import NextImage from 'next/image';
import { Menu } from 'lucide-react';
import { SidebarTrigger } from '@sentinel/ui';
import dynamic from 'next/dynamic';
import { DashboardProfileDropdownFallback } from '../common/dashboard-profile-dropdown';
import { useProfileQuery } from '@sentinel/hooks';
import { CoreNotificationDropdown } from '../common/core-notification-dropdown';
import { UserSearchBar } from '@/components/common/user-search-bar';

const DashboardProfileDropdown = dynamic(
    () =>
        import('../common/dashboard-profile-dropdown').then((mod) => mod.DashboardProfileDropdown),
    {
        ssr: false,
        loading: () => <DashboardProfileDropdownFallback />,
    },
);

export function AdminHeader() {
    const { profile, isLoading } = useProfileQuery();

    return (
        <header className="border-border/40 bg-background/80 relative sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b px-4 backdrop-blur-md md:px-6">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden">
                    <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <div className="flex items-center gap-4">
                    <div className="relative h-8 w-32">
                        <NextImage
                            src="/icons/light-sentinel-logo.svg"
                            alt="Sentinel Logo"
                            fill
                            className="object-contain dark:hidden"
                            priority
                        />
                        <NextImage
                            src="/icons/dark-sentinel-logo.svg"
                            alt="Sentinel Logo"
                            fill
                            className="hidden object-contain dark:block"
                            priority
                        />
                    </div>
                    <div className="bg-border hidden h-6 w-px md:block" />
                    {!isLoading && profile?.institution && (
                        <span className="text-muted-foreground hidden text-sm font-medium whitespace-nowrap md:block">
                            {profile.institution}
                        </span>
                    )}
                </div>
            </div>

            <div className="absolute left-1/2 hidden -translate-x-1/2 md:flex">
                <UserSearchBar redirectPath="/messages" />
            </div>

            <div className="flex items-center gap-4">
                <CoreNotificationDropdown />
                <DashboardProfileDropdown />
            </div>
        </header>
    );
}

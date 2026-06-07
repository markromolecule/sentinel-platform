'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset, cn } from '@sentinel/ui';
import { AdminHeader } from '@/components/sidebar/admin/admin-header';
import { useUser } from '@/hooks/use-user';
import { CoreAdminSidebar } from '@/components/sidebar/common/core-admin-sidebar';
import { useCoreAdminCapabilities } from '@/hooks/use-core-admin-capabilities';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { data: user, isLoading } = useUser();
    const { canViewPage } = useCoreAdminCapabilities();
    const pathname = usePathname();
    const isMessages = pathname === '/messages';

    if (isLoading) {
        return (
            <div className="bg-background flex h-screen items-center justify-center">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
        );
    }

    const role = user?.role;
    const canViewOverview = canViewPage('overview');

    return (
        <SidebarProvider
            defaultOpen={false}
            className="flex-col [&_[data-slot=sidebar-gap]]:w-[var(--sidebar-width-icon)]"
        >
            <AdminHeader />
            <div className="relative flex w-full flex-1 overflow-hidden">
                <CoreAdminSidebar />
                <SidebarInset className="relative !ml-0">
                    <main
                        data-app-scroll-container="admin"
                        className={cn(
                            'flex-1',
                            isMessages ? 'overflow-hidden p-0' : 'overflow-auto p-6',
                        )}
                    >
                        {role === 'admin' || role === 'superadmin' || canViewOverview
                            ? children
                            : null}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}

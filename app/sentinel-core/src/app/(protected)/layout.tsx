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
            className={cn(
                'flex-col [&_[data-slot=sidebar-gap]]:w-[var(--sidebar-width-icon)]',
                isMessages && 'h-screen !min-h-0 overflow-hidden',
            )}
        >
            <AdminHeader />
            <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
                <CoreAdminSidebar />
                <SidebarInset
                    className={cn('relative !ml-0', isMessages && 'min-h-0 flex-1 overflow-hidden')}
                >
                    <main
                        data-app-scroll-container="admin"
                        className={cn(
                            'flex-1',
                            isMessages
                                ? 'flex min-h-0 flex-1 flex-col overflow-hidden p-0'
                                : 'overflow-auto p-6',
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

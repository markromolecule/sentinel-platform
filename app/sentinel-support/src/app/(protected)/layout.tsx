'use client';

import { SidebarProvider, SidebarInset } from '@sentinel/ui';
import { SuperAdminSidebar } from '@/components/sidebar/support/support-sidebar';
import { SuperAdminHeader } from '@/components/sidebar/support/support-header';
import { useUser } from '@/hooks/use-user';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { data: user, isLoading } = useUser();

    if (isLoading) {
        return (
            <div className="bg-background flex h-screen items-center justify-center">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
            </div>
        );
    }

    return (
        <SidebarProvider
            defaultOpen={false}
            className="flex-col [&_[data-slot=sidebar-gap]]:w-[var(--sidebar-width-icon)]"
        >
            <SuperAdminHeader />
            <div className="relative flex w-full flex-1 overflow-hidden">
                <SuperAdminSidebar />
                <SidebarInset className="relative !ml-0">
                    <main data-app-scroll-container="support" className="flex-1 overflow-auto p-6">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}

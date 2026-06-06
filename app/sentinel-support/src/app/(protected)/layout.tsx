'use client';

import { Suspense } from 'react';
import { SidebarProvider, SidebarInset } from '@sentinel/ui';
import { SuperAdminSidebar } from '@/components/sidebar/support/support-sidebar';
import { SupportHeader } from '@/components/sidebar/support/support-header';

/**
 * Protected layout for the sentinel-support portal.
 * Renders the sidebar and header immediately without blocking on auth state.
 * Route-level authentication and RBAC are handled server-side in proxy.ts.
 * The DashboardProfileDropdown self-manages its loading state via DashboardProfileDropdownFallback.
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider
            defaultOpen={false}
            className="flex-col [&_[data-slot=sidebar-gap]]:w-[var(--sidebar-width-icon)]"
        >
            <SupportHeader />
            <div className="relative flex w-full flex-1 overflow-hidden">
                <Suspense
                    fallback={<div className="bg-background w-[var(--sidebar-width-icon)]" />}
                >
                    <SuperAdminSidebar />
                </Suspense>
                <SidebarInset className="relative !ml-0">
                    <main data-app-scroll-container="support" className="flex-1 overflow-auto p-6">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}

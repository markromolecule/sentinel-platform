'use client';

import { SidebarProvider, SidebarInset } from '@sentinel/ui';
import { AdminSidebar } from '@/components/sidebar/admin/admin-sidebar';
import { AdminHeader } from '@/components/sidebar/admin/admin-header';
import { SuperAdminSidebar } from '@/components/sidebar/superadmin/superadmin-sidebar';
import { SuperAdminHeader } from '@/components/sidebar/superadmin/superadmin-header';
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

    const role = user?.role;

    return (
        <SidebarProvider
            defaultOpen={false}
            className="flex-col [&_[data-slot=sidebar-gap]]:w-[var(--sidebar-width-icon)]"
        >
            {role === 'superadmin' ? <SuperAdminHeader /> : <AdminHeader />}
            <div className="relative flex w-full flex-1 overflow-hidden">
                {role === 'superadmin' ? <SuperAdminSidebar /> : <AdminSidebar />}
                <SidebarInset className="relative !ml-0">
                    <main data-app-scroll-container="admin" className="flex-1 overflow-auto p-6">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}

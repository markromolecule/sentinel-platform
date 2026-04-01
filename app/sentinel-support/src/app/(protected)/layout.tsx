"use client";

import { SidebarProvider, SidebarInset } from "@sentinel/ui";
import { SuperAdminSidebar } from "@/components/sidebar/superadmin/superadmin-sidebar";
import { SuperAdminHeader } from "@/components/sidebar/superadmin/superadmin-header";
import { useUser } from "@/hooks/use-user";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: user, isLoading } = useUser();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <SidebarProvider defaultOpen={false} className="[&_[data-slot=sidebar-gap]]:w-[var(--sidebar-width-icon)] flex-col">
            <SuperAdminHeader />
            <div className="flex flex-1 relative overflow-hidden w-full">
                <SuperAdminSidebar />
                <SidebarInset className="relative !ml-0">
                    <main className="flex-1 p-6 overflow-auto">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}

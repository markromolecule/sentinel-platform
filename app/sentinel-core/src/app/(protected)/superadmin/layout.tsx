"use client";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@sentinel/ui";
import { SuperAdminSidebar } from "@/components/protected/superadmin/superadmin-sidebar";
import { Separator } from "@sentinel/ui";
import { ThemeToggle } from "@sentinel/ui";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <SuperAdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex items-center gap-2 px-4">
                        <p className="text-sm font-medium">Sentinel - Superadmin Console</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <ThemeToggle />
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
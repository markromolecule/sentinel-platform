"use client";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/protected/admin/admin-sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex items-center gap-2 px-4">
                        <p className="text-sm font-medium">NU Dasmariñas - Administrative Console</p>
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
    )
}

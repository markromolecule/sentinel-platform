"use client";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@sentinel/ui";
import { AdminSidebar } from "@/components/sidebar/admin/admin-sidebar";
import { SuperAdminSidebar } from "@/components/sidebar/superadmin/superadmin-sidebar";
import { Separator, ThemeToggle } from "@sentinel/ui";
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

    const role = user?.user_metadata?.role;

    return (
        <SidebarProvider>
            {role === "superadmin" ? <SuperAdminSidebar /> : <AdminSidebar />}
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex items-center gap-2 px-4">
                        <p className="text-sm font-medium">
                            {role === "superadmin"
                                ? "Sentinel - Superadmin Console"
                                : "NU Dasmariñas - Administrative Console"}
                        </p>
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

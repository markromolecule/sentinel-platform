"use client";

import { SidebarProvider, SidebarInset } from "@sentinel/ui";
import { ProctorSidebar, ProctorHeader } from "@/components/sidebar/proctor/proctor-sidebar";

export function ProctorLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <ProctorSidebar />
            <SidebarInset>
                <ProctorHeader />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

"use client";

import { Suspense } from "react";
import { SidebarProvider, SidebarInset } from "@sentinel/ui";
import { ProctorSidebar, ProctorHeader } from "@/components/sidebar/proctor/proctor-sidebar";

export default function ProctorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-muted-foreground">Loading layout...</div>}>
            <SidebarProvider>
                <ProctorSidebar />
                <SidebarInset>
                    <ProctorHeader />
                    <main className="flex-1 p-6">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </Suspense>
    );
}

"use client";

import { Suspense } from "react";
import { SidebarProvider, SidebarInset } from "@sentinel/ui";
import { InstructorSidebar, InstructorHeader } from "@/components/sidebar/instructor/instructor-sidebar";
import { PageShell } from "@/components/common";

export default function ProctorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-muted-foreground">Loading layout...</div>}>
            <SidebarProvider defaultOpen={false} className="[&_[data-slot=sidebar-gap]]:w-[var(--sidebar-width-icon)] flex-col">
                <InstructorHeader />
                <div className="flex flex-1 relative overflow-hidden w-full">
                    <InstructorSidebar />
                    <SidebarInset className="relative !ml-0">
                        <main
                            data-app-scroll-container="instructor"
                            className="flex-1 overflow-auto [scrollbar-gutter:stable]"
                        >
                            <PageShell maxWidth="full" container={false} className="p-6">
                                {children}
                            </PageShell>
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </Suspense>
    );
}

'use client';

import { Suspense } from 'react';
import { SidebarProvider, SidebarInset } from '@sentinel/ui';
import {
    InstructorSidebar,
    InstructorHeader,
} from '@/components/sidebar/instructor/instructor-sidebar';
import { PageShell } from '@/components/common';

export default function ProctorLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense
            fallback={
                <div className="text-muted-foreground flex h-screen items-center justify-center text-sm">
                    Loading layout...
                </div>
            }
        >
            <SidebarProvider
                defaultOpen={false}
                className="flex-col [&_[data-slot=sidebar-gap]]:w-[var(--sidebar-width-icon)]"
            >
                <InstructorHeader />
                <div className="relative flex w-full flex-1 overflow-hidden">
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

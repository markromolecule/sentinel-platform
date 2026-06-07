'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset, cn } from '@sentinel/ui';
import {
    InstructorSidebar,
    InstructorHeader,
} from '@/components/sidebar/instructor/instructor-sidebar';
import { PageShell } from '@/components/common';

export default function ProctorLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isMessages = pathname === '/messages';

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
                            className={cn(
                                'flex-1',
                                isMessages ? 'overflow-hidden' : 'overflow-auto [scrollbar-gutter:stable]',
                            )}
                        >
                            <PageShell
                                maxWidth="full"
                                container={false}
                                className={cn(isMessages ? 'p-0 h-full gap-0' : 'p-6')}
                            >
                                {children}
                            </PageShell>
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </Suspense>
    );
}

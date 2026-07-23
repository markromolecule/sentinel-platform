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
                className={cn(
                    'flex-col [&_[data-slot=sidebar-gap]]:w-[var(--sidebar-width-icon)]',
                    isMessages && 'h-screen !min-h-0 overflow-hidden',
                )}
            >
                <InstructorHeader />
                <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
                    <InstructorSidebar />
                    <SidebarInset
                        className={cn(
                            'relative !ml-0',
                            isMessages && 'min-h-0 flex-1 overflow-hidden',
                        )}
                    >
                        <main
                            data-app-scroll-container="instructor"
                            className={cn(
                                'flex-1',
                                isMessages
                                    ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
                                    : 'overflow-auto [scrollbar-gutter:stable]',
                            )}
                        >
                            <PageShell
                                maxWidth="full"
                                container={false}
                                className={cn(
                                    isMessages ? 'min-h-0 flex-1 gap-0 overflow-hidden p-0' : 'p-6',
                                )}
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

'use client';

import { type ReactNode } from 'react';
import { DashboardSidebar } from './dashboard-sidebar';

interface DashboardShellProps {
    /** The main dashboard content rendered in the left/primary column. */
    children: ReactNode;
}

/**
 * DashboardShell provides a two-column layout for the core dashboard page.
 * The primary content (children) occupies the left flexible column, and a sticky
 * right sidebar hosts the Calendar and Announcements widgets.
 *
 * On viewports smaller than `lg`, the sidebar collapses and stacks below the main content.
 *
 * @param props.children - The main content to render in the primary column.
 */
export function DashboardShell({ children }: DashboardShellProps) {
    return (
        <div className="relative flex min-h-[calc(100vh-64px)] flex-col lg:h-[calc(100svh-64px)] lg:min-h-0 lg:-m-6 lg:flex-row lg:items-stretch lg:overflow-hidden">
            {/* Main Content */}
            <main
                data-lenis-prevent
                className="min-w-0 flex-1 space-y-6 p-6 pb-10 lg:min-h-0 lg:overflow-y-auto lg:[-ms-overflow-style:none] lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden"
            >
                {children}
            </main>

            {/* Right Sidebar — desktop only (sticky) */}
            <div
                data-lenis-prevent
                className="bg-background hidden w-80 shrink-0 flex-col border-l lg:flex lg:h-full lg:min-h-0 lg:overflow-y-auto lg:[-ms-overflow-style:none] lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden"
            >
                <DashboardSidebar />
            </div>

            {/* Right Sidebar — mobile (stacks below main content) */}
            <div className="block border-t lg:hidden">
                <DashboardSidebar />
            </div>
        </div>
    );
}

'use client';

import { type ReactNode } from 'react';
import { DashboardSidebar } from './dashboard-sidebar';

interface DashboardShellProps {
    /** The main dashboard content rendered in the left/primary column. */
    children: ReactNode;
}

/**
 * DashboardShell provides a two-column layout for the support dashboard page.
 * The primary content (children) occupies the left flexible column, and a sticky
 * right sidebar hosts the Calendar and Announcements widgets.
 *
 * This mirrors the SubjectWorkspaceShell pattern used in the subjects section,
 * but the sidebar is positioned on the right and contains dashboard-specific widgets.
 *
 * On viewports smaller than `lg`, the sidebar collapses and stacks below the main content.
 *
 * @param props.children - The main content to render in the primary column.
 */
export function DashboardShell({ children }: DashboardShellProps) {
    return (
        <div className="relative flex min-h-[calc(100vh-64px)] flex-col lg:-m-6 lg:flex-row lg:items-stretch">
            {/* Main Content */}
            <main className="min-w-0 flex-1 space-y-6 p-6 pb-10">{children}</main>

            {/* Right Sidebar — desktop only (sticky) */}
            <div className="bg-background sticky top-0 hidden w-80 shrink-0 flex-col border-l overflow-y-auto lg:flex">
                <DashboardSidebar />
            </div>

            {/* Right Sidebar — mobile (stacks below main content) */}
            <div className="block border-t lg:hidden">
                <DashboardSidebar />
            </div>
        </div>
    );
}

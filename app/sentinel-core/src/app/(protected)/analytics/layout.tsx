'use client';

import type { ReactNode } from 'react';
import { AnalyticsWorkspaceShell } from './_components/layout';

/**
 * CoreAnalyticsLayout wraps all sub-pages under the analytics route with the persistent sidebar shell.
 *
 * @param props - Layout props containing children ReactNode
 */
export default function CoreAnalyticsLayout({ children }: { children: ReactNode }) {
    return <AnalyticsWorkspaceShell>{children}</AnalyticsWorkspaceShell>;
}

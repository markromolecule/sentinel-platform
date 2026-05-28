'use client';

import type { ReactNode } from 'react';
import { LogsWorkspaceShell } from './_components/layout';

/**
 * CoreLogsLayout wraps all sub-pages under the logs route with the persistent sidebar shell.
 *
 * @param props - Layout props containing children ReactNode
 */
export default function CoreLogsLayout({ children }: { children: ReactNode }) {
    return <LogsWorkspaceShell>{children}</LogsWorkspaceShell>;
}

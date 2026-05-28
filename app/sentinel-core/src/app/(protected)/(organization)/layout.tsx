'use client';

import type { ReactNode } from 'react';
import { OrganizationWorkspaceShell } from './_components/layout';

/**
 * CoreOrganizationLayout wraps all sub-pages under the organization route group with the persistent sidebar shell.
 *
 * @param props - Layout props containing children ReactNode
 */
export default function CoreOrganizationLayout({ children }: { children: ReactNode }) {
    return <OrganizationWorkspaceShell>{children}</OrganizationWorkspaceShell>;
}

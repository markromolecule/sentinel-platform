'use client';

import type { ReactNode } from 'react';
import { IdentityWorkspaceShell } from './_components/layout';
import { useUser } from '@/hooks/use-user';

/**
 * SuperadminIdentityLayout wraps all sub-pages under the superadmin route group with the persistent identity sidebar shell.
 *
 * @param props - Layout props containing children ReactNode
 */
export default function SuperadminIdentityLayout({ children }: { children: ReactNode }) {
    const { data: user } = useUser();
    const role = user?.role;

    return <IdentityWorkspaceShell role={role}>{children}</IdentityWorkspaceShell>;
}

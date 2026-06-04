'use client';

import { type ReactNode } from 'react';
import { IdentityWorkspaceShell } from '@/app/(protected)/(superadmin)/_components/layout';
import { useUser } from '@/hooks/use-user';

/**
 * AdministratorsLayout wraps administrators sub-pages with the identity workspace shell
 * and passes down the logged-in user's role.
 *
 * @param props - Layout props containing children ReactNode
 */
export default function AdministratorsLayout({ children }: { children: ReactNode }) {
    const { data: user } = useUser();
    const role = user?.role;

    return <IdentityWorkspaceShell role={role}>{children}</IdentityWorkspaceShell>;
}

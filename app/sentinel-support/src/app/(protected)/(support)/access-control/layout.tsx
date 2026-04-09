import type { ReactNode } from 'react';
import { AccessControlWorkspaceShell } from '@/app/(protected)/(support)/access-control/_components';

export default function AccessControlLayout({ children }: { children: ReactNode }) {
    return <AccessControlWorkspaceShell>{children}</AccessControlWorkspaceShell>;
}

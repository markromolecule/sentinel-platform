'use client';

import type { ReactNode } from 'react';
import { SubjectWorkspaceShell } from './_components/layout';

/**
 * SupportSubjectsLayout wraps all sub-pages under the subjects route group with the persistent sidebar shell.
 *
 * @param props - Layout props containing children ReactNode
 */
export default function SupportSubjectsLayout({ children }: { children: ReactNode }) {
    return <SubjectWorkspaceShell>{children}</SubjectWorkspaceShell>;
}

'use client';

import type { ReactNode } from 'react';
import { ExamsWorkspaceShell } from './_components/layout';

/**
 * InstructorExamsLayout wraps the instructor exams routes with the local exams shell.
 *
 * @param props - Layout props containing children ReactNode.
 */
export default function InstructorExamsLayout({ children }: { children: ReactNode }) {
    return <ExamsWorkspaceShell>{children}</ExamsWorkspaceShell>;
}

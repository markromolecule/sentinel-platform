'use client';

import type { ReactNode } from 'react';
import { ExamSessionWorkspaceShell } from './_components/exam-session-workspace-shell';

/**
 * InstructorExamSessionLayout wraps dynamic instructor exam routes with runtime navigation.
 *
 * @param props - Layout props containing children ReactNode.
 */
export default function InstructorExamSessionLayout({ children }: { children: ReactNode }) {
    return <ExamSessionWorkspaceShell>{children}</ExamSessionWorkspaceShell>;
}

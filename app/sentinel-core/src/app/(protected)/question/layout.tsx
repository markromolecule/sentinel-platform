'use client';

import type { ReactNode } from 'react';
import { QuestionBankWorkspaceShell } from './_components/layout';

/**
 * InstructorQuestionLayout wraps the instructor question routes with the local question shell.
 *
 * @param props - Layout props containing children ReactNode.
 */
export default function InstructorQuestionLayout({ children }: { children: ReactNode }) {
    return <QuestionBankWorkspaceShell>{children}</QuestionBankWorkspaceShell>;
}

import type { ReactNode } from 'react';

type QuestionBankPageShellProps = {
    children: ReactNode;
    className?: string;
};

/**
 * QuestionBankPageShell provides consistent spacing for question bank pages.
 *
 * @param props - QuestionBankPageShellProps containing children and optional className.
 */
export function QuestionBankPageShell({ children, className }: QuestionBankPageShellProps) {
    return <div className={['flex flex-col gap-6 p-4 md:p-6', className].filter(Boolean).join(' ')}>{children}</div>;
}

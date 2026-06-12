import type { ReactNode } from 'react';

type ExamsPageShellProps = {
    children: ReactNode;
    className?: string;
};

/**
 * ExamsPageShell provides consistent spacing for instructor exam pages.
 *
 * @param props - ExamsPageShellProps containing children and optional className.
 */
export function ExamsPageShell({ children, className }: ExamsPageShellProps) {
    return (
        <div className={['flex flex-col gap-6 p-4 md:p-6', className].filter(Boolean).join(' ')}>
            {children}
        </div>
    );
}

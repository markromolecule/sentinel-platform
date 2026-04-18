'use client';

import type { ReactNode } from 'react';
import { cn } from '@sentinel/ui';
import { StudentFlowHeader } from './student-flow-header';

type StudentFlowShellProps = {
    children: ReactNode;
    maxWidthClassName?: string;
    showBackButton?: boolean;
    mainClassName?: string;
    contentClassName?: string;
};

export function StudentFlowShell({
    children,
    maxWidthClassName = 'max-w-6xl',
    showBackButton = false,
    mainClassName,
    contentClassName,
}: StudentFlowShellProps) {
    return (
        <div className="selection:bg-primary/10 flex min-h-screen flex-col bg-white font-sans">
            <StudentFlowHeader
                maxWidthClassName={maxWidthClassName}
                showBackButton={showBackButton}
            />

            <main
                className={cn(
                    'flex flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 xl:px-10',
                    mainClassName,
                )}
            >
                <div className={cn('mx-auto my-auto w-full', maxWidthClassName, contentClassName)}>
                    {children}
                </div>
            </main>
        </div>
    );
}

'use client';

import type { ReactNode } from 'react';

type ExamAttemptShellHeaderProps = {
    title: string;
    timerLabel: string;
    status?: ReactNode;
    toolbar?: ReactNode;
};

export function ExamAttemptShellHeader({
    title,
    timerLabel,
    status,
    toolbar,
}: ExamAttemptShellHeaderProps) {
    return (
        <header className="border-border/60 border-b px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-foreground truncate text-xl font-semibold tracking-tight sm:text-[1.8rem]">
                            {title}
                        </h1>
                        {status ? <div className="flex flex-wrap items-center gap-2">{status}</div> : null}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="border-border/60 bg-muted/20 border px-4 py-2 text-sm font-semibold">
                        {timerLabel}
                    </div>
                    {toolbar}
                </div>
            </div>
        </header>
    );
}

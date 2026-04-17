'use client';

import { Badge, cn } from '@sentinel/ui';

import type { ExamStageShellProps } from './types';
import { isPreviewMode } from './utils';

export function ExamStageShell({
    mode = 'runtime',
    eyebrow,
    title,
    description,
    main,
    aside,
    footer,
}: ExamStageShellProps) {
    return (
        <section className="flex h-full flex-col">
            <div className="border-border/60 border-b px-6 py-6 sm:px-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                        {eyebrow ? (
                            <p className="text-primary text-[11px] font-semibold tracking-[0.18em] uppercase">
                                {eyebrow}
                            </p>
                        ) : null}
                        <div className="space-y-1">
                            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
                                {title}
                            </h1>
                            {description ? (
                                <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base">
                                    {description}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {isPreviewMode(mode) ? (
                        <Badge
                            variant="outline"
                            className="border-primary/20 bg-primary/5 text-primary px-3 py-1 text-[10px] tracking-[0.18em] uppercase"
                        >
                            Preview-safe
                        </Badge>
                    ) : null}
                </div>
            </div>

            <div
                className={cn(
                    'grid flex-1 gap-0',
                    aside ? 'xl:grid-cols-[minmax(0,1fr)_320px]' : 'grid-cols-1',
                )}
            >
                <div className="min-w-0">{main}</div>
                {aside ? (
                    <aside className="border-border/60 bg-muted/20 border-t xl:border-t-0 xl:border-l">
                        {aside}
                    </aside>
                ) : null}
            </div>

            {footer ? <div className="border-border/60 border-t px-6 py-4 sm:px-8">{footer}</div> : null}
        </section>
    );
}

'use client';

import type { ReactNode } from 'react';
import { cn } from '@sentinel/ui';

type ExamFormSectionProps = {
    title: string;
    description: string;
    aside?: ReactNode;
    children: ReactNode;
    className?: string;
};

export function ExamFormSection({
    aside,
    children,
    className,
    description,
    title,
}: ExamFormSectionProps) {
    return (
        <section className={cn('space-y-5', className)}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-0.5">
                    <h3 className="text-lg font-bold tracking-tight text-[#323d8f]">{title}</h3>
                    <p className="text-muted-foreground/80 max-w-2xl text-[13px] leading-relaxed">
                        {description}
                    </p>
                </div>
                {aside}
            </div>

            <div className="space-y-5">{children}</div>
        </section>
    );
}

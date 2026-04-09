import type { ReactNode } from 'react';
import { cn } from '@sentinel/ui';

type AccessControlSectionProps = {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
};

export function AccessControlSection({
    title,
    description,
    actions,
    children,
    className,
    contentClassName,
}: AccessControlSectionProps) {
    return (
        <section className={cn('overflow-hidden rounded-xl border bg-background', className)}>
            <div className="flex flex-col gap-3 border-b px-4 py-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <h2 className="text-base font-semibold tracking-tight">{title}</h2>
                    {description ? (
                        <p className="text-muted-foreground text-sm">{description}</p>
                    ) : null}
                </div>
                {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
            <div className={cn('p-4', contentClassName)}>{children}</div>
        </section>
    );
}

import type { ReactNode } from 'react';
import { PageHeader, Separator } from '@sentinel/ui';

type AnalyticsPageShellProps = {
    title: string;
    description: string;
    actions?: ReactNode;
    children: ReactNode;
};

/**
 * AnalyticsPageShell wraps an individual sub-page with a standardized PageHeader, optional actions,
 * and a Separator.
 *
 * @param props - AnalyticsPageShellProps
 */
export function AnalyticsPageShell({
    title,
    description,
    actions,
    children,
}: AnalyticsPageShellProps) {
    return (
        <div className="flex min-w-0 flex-col gap-5">
            <PageHeader title={title} description={description} className="px-0">
                {actions}
            </PageHeader>
            <Separator />
            <div className="min-w-0">{children}</div>
        </div>
    );
}

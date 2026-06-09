import type { ReactNode } from 'react';
import { PageHeader, Separator } from '@sentinel/ui';

type LogsPageShellProps = {
    title: string;
    description: string;
    actions?: ReactNode;
    children: ReactNode;
};

/**
 * LogsPageShell wraps an individual sub-page with a standardized PageHeader, optional actions,
 * and a Separator.
 *
 * @param props - LogsPageShellProps
 */
export function LogsPageShell({ title, description, actions, children }: LogsPageShellProps) {
    return (
        <div className="flex min-w-0 flex-col gap-6">
            <PageHeader title={title} description={description} className="px-0">
                {actions}
            </PageHeader>
            <Separator />
            <div className="min-w-0">{children}</div>
        </div>
    );
}

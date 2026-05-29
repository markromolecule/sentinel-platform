import type { ReactNode } from 'react';
import { PageHeader, Separator } from '@sentinel/ui';

type SubjectPageShellProps = {
    title: string;
    description: string;
    actions?: ReactNode;
    children: ReactNode;
};

/**
 * SubjectPageShell wraps an individual sub-page with a standardized PageHeader, optional actions,
 * and a Separator, matching the pattern of TelemetryPageShell.
 *
 * @param props - SubjectPageShellProps
 */
export function SubjectPageShell({ title, description, actions, children }: SubjectPageShellProps) {
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

import type { ReactNode } from 'react';
import { PageHeader, Separator } from '@sentinel/ui';

type OrganizationPageShellProps = {
    title: string;
    description: string;
    actions?: ReactNode;
    children: ReactNode;
};

/**
 * OrganizationPageShell wraps an individual sub-page with a standardized PageHeader, optional actions,
 * and a Separator.
 *
 * @param props - OrganizationPageShellProps
 */
export function OrganizationPageShell({
    title,
    description,
    actions,
    children,
}: OrganizationPageShellProps) {
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

import type { ReactNode } from 'react';
import { PageHeader, Separator } from '@sentinel/ui';

type AccessControlPageShellProps = {
    title: string;
    description: string;
    actions?: ReactNode;
    children: ReactNode;
};

export function AccessControlPageShell({
    title,
    description,
    actions,
    children,
}: AccessControlPageShellProps) {
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

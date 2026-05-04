import type { ReactNode } from 'react';
import { PageHeader, Separator } from '@sentinel/ui';

type TelemetryPageShellProps = {
    title: string;
    description: string;
    actions?: ReactNode;
    children: ReactNode;
};

export function TelemetryPageShell({
    title,
    description,
    actions,
    children,
}: TelemetryPageShellProps) {
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

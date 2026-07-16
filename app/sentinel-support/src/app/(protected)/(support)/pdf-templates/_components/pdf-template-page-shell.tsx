import type { ReactNode } from 'react';
import { PageHeader, Separator } from '@sentinel/ui';

type PdfTemplatePageShellProps = {
    title: string;
    description: string;
    actions?: ReactNode;
    children: ReactNode;
};

export function PdfTemplatePageShell({
    title,
    description,
    actions,
    children,
}: PdfTemplatePageShellProps) {
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

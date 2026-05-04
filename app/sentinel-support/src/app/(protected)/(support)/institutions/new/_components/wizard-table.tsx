import type { ReactNode } from 'react';

export function WizardTable({
    columns,
    templateColumns,
    children,
}: {
    columns: string[];
    templateColumns: string;
    children: ReactNode;
}) {
    const gridTemplateColumns = templateColumns.replaceAll('_', ' ');

    return (
        <div className="border-border overflow-x-auto rounded-md border bg-white">
            <div className="min-w-max">
                <div
                    className="bg-muted/40 text-muted-foreground grid items-center gap-3 border-b px-4 py-3 text-xs font-medium"
                    style={{ gridTemplateColumns }}
                >
                    {columns.map((column, index) => (
                        <div key={`${column}-${index}`}>{column}</div>
                    ))}
                </div>
                <div className="divide-y">{children}</div>
            </div>
        </div>
    );
}

export function WizardTableRow({
    templateColumns,
    children,
}: {
    templateColumns: string;
    children: ReactNode;
}) {
    return (
        <div
            className="grid items-center gap-3 px-4 py-3"
            style={{ gridTemplateColumns: templateColumns.replaceAll('_', ' ') }}
        >
            {children}
        </div>
    );
}

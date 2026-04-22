'use client';

import { Separator } from '@sentinel/ui';

export type StatusItem = {
    label: string;
    value: string;
    hint?: string;
};

export type StatusStripProps = {
    items: StatusItem[];
};

export function StatusStrip({ items }: StatusStripProps) {
    return (
        <div className="flex flex-wrap gap-4">
            {items.map((item, index) => (
                <div 
                    key={index} 
                    className="flex min-w-[140px] flex-1 flex-col gap-1.5 rounded-xl border bg-card/50 p-4 transition-all hover:bg-card hover:shadow-sm"
                >
                    <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase opacity-70">
                        {item.label}
                    </span>
                    <span className="text-sm font-bold tabular-nums tracking-tight text-foreground/90">
                        {item.value}
                    </span>
                    {item.hint ? (
                        <span className="text-muted-foreground text-[11px] leading-snug italic opacity-80">
                            {item.hint}
                        </span>
                    ) : null}
                </div>
            ))}
        </div>
    );
}

export type KeyValueRowProps = {
    rows: [string, string][];
};

export function KeyValueList({ rows }: KeyValueRowProps) {
    return (
        <div className="rounded-lg border">
            {rows.map(([label, value], index) => (
                <div key={label}>
                    <div className="grid grid-cols-[1fr_1.4fr] items-center gap-2 px-4 py-2.5">
                        <span className="text-muted-foreground text-xs font-medium">{label}</span>
                        <span className="text-sm font-medium tabular-nums">{value}</span>
                    </div>
                    {index < rows.length - 1 ? <Separator /> : null}
                </div>
            ))}
        </div>
    );
}

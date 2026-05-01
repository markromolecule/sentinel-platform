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
        <div className="grid grid-cols-1 gap-0 border-t border-l sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="bg-background hover:bg-muted/5 flex flex-col gap-1.5 border-r border-b p-5 transition-colors"
                >
                    <span className="text-muted-foreground/80 text-[12px] font-bold">
                        {item.label}
                    </span>
                    <span className="text-foreground text-[16px] font-bold tracking-tight tabular-nums">
                        {item.value}
                    </span>
                    {item.hint ? (
                        <span className="text-muted-foreground text-[12px] leading-snug font-medium italic opacity-80">
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
        <div className="border-muted/50 rounded-none border">
            {rows.map(([label, value], index) => (
                <div key={label}>
                    <div className="grid grid-cols-[1fr_1.4fr] items-center gap-2 px-4 py-3">
                        <span className="text-muted-foreground text-[13px] font-medium">
                            {label}
                        </span>
                        <span className="text-foreground text-[14px] font-bold tabular-nums">
                            {value}
                        </span>
                    </div>
                    {index < rows.length - 1 ? <Separator className="bg-muted/50" /> : null}
                </div>
            ))}
        </div>
    );
}

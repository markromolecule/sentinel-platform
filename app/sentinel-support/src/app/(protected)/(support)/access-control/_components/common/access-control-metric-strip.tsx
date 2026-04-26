type AccessControlMetricStripProps = {
    items: {
        label: string;
        value: string | number;
        hint: string;
    }[];
};

export function AccessControlMetricStrip({ items }: AccessControlMetricStripProps) {
    return (
        <div className="bg-background overflow-hidden rounded-none border border-muted/50">
            <div className="grid divide-y md:grid-cols-4 md:divide-x md:divide-y-0 divide-border">
                {items.map((item) => (
                    <div key={item.label} className="flex flex-col gap-1 px-6 py-4 transition-colors hover:bg-muted/30">
                        <div className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                            {item.label}
                        </div>
                        <div className="text-xl font-bold tracking-tighter text-foreground tabular-nums">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

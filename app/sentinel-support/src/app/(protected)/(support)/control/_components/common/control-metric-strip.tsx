type AccessControlMetricStripProps = {
    items: {
        label: string;
        value: string | number;
        hint: string;
    }[];
};

export function AccessControlMetricStrip({ items }: AccessControlMetricStripProps) {
    return (
        <div className="bg-background border-muted/50 overflow-hidden rounded-none border">
            <div className="divide-border grid divide-y md:grid-cols-4 md:divide-x md:divide-y-0">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className="hover:bg-muted/30 flex flex-col gap-1 px-6 py-4 transition-colors"
                    >
                        <div className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                            {item.label}
                        </div>
                        <div className="text-foreground text-xl font-bold tracking-tighter tabular-nums">
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

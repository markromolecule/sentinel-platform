type AccessControlMetricStripProps = {
    items: {
        label: string;
        value: string | number;
        hint: string;
    }[];
};

export function AccessControlMetricStrip({ items }: AccessControlMetricStripProps) {
    return (
        <div className="bg-background overflow-hidden rounded-xl border">
            <div className="grid divide-y md:grid-cols-4 md:divide-x md:divide-y-0">
                {items.map((item) => (
                    <div key={item.label} className="space-y-2 px-4 py-4">
                        <div className="text-muted-foreground text-xs font-medium tracking-[0.12em] uppercase">
                            {item.label}
                        </div>
                        <div className="text-2xl font-semibold tracking-tight">{item.value}</div>
                        <p className="text-muted-foreground text-sm">{item.hint}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

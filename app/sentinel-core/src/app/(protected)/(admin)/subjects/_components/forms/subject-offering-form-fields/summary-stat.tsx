interface SummaryStatProps {
    label: string;
    value: string;
    tone?: 'neutral' | 'accent';
}

export function SummaryStat({ label, value, tone = 'neutral' }: SummaryStatProps) {
    return (
        <div
            className={`rounded-xl border px-3 py-3 ${
                tone === 'accent' ? 'border-[#323d8f]/20 bg-[#323d8f]/5' : 'bg-background'
            }`}
        >
            <p className="text-muted-foreground text-[11px] font-medium tracking-[0.12em] uppercase">
                {label}
            </p>
            <p className="text-foreground mt-1 text-sm leading-5 font-semibold sm:text-base">
                {value}
            </p>
        </div>
    );
}

interface RequestOfferedSubjectBuilderSummaryStatProps {
    label: string;
    value: string;
    tone?: 'neutral' | 'accent';
}

export function RequestOfferedSubjectBuilderSummaryStat({
    label,
    value,
    tone = 'neutral',
}: RequestOfferedSubjectBuilderSummaryStatProps) {
    return (
        <div
            className={`rounded-xl border px-3 py-2.5 ${
                tone === 'accent' ? 'border-[#323d8f]/20 bg-[#323d8f]/5' : 'bg-background'
            }`}
        >
            <p className="text-muted-foreground text-[10px] font-bold tracking-[0.05em] uppercase">
                {label}
            </p>
            <p className="text-foreground mt-0.5 text-[13px] leading-tight font-bold">{value}</p>
        </div>
    );
}

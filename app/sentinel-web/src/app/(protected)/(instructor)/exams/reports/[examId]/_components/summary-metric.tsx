import * as React from 'react';

type SummaryMetricProps = {
    label: string;
    value: string;
    hint: string;
};

/**
 * A simple metric card display component showing a label, a large value, and a hint description.
 * Useful for summarizing high-level metrics inside dashboards.
 */
export function SummaryMetric({ label, value, hint }: SummaryMetricProps) {
    return (
        <div className="space-y-1.5 border-l pl-4 first:border-l-0 first:pl-0">
            <div className="text-muted-foreground text-sm font-medium">{label}</div>
            <div className="text-3xl font-semibold tracking-tight">{value}</div>
            <div className="text-muted-foreground text-sm">{hint}</div>
        </div>
    );
}

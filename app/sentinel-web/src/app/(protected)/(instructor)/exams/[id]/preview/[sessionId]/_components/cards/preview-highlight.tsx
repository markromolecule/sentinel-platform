import { LucideIcon } from 'lucide-react';

interface PreviewHighlightProps {
    label: string;
    value: string;
    icon: LucideIcon;
}

export function PreviewHighlight({ label, value, icon: Icon }: PreviewHighlightProps) {
    return (
        <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-2">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[11px] font-medium tracking-[0.14em] uppercase">
                    {label}
                </span>
            </div>
            <p className="text-sm leading-5 font-semibold">{value}</p>
        </div>
    );
}

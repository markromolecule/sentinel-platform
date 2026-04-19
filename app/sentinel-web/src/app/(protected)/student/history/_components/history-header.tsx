import { HistoryHeaderProps } from '@sentinel/shared/types';

export function HistoryHeader({ title, description }: HistoryHeaderProps) {
    return (
        <div className="space-y-1 py-2">
            <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                {title}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
        </div>
    );
}

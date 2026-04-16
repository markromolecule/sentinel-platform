import { HistoryHeaderProps } from '@sentinel/shared/types';

export function HistoryHeader({ title, description }: HistoryHeaderProps) {
    return (
        <div className="space-y-2 py-4">
            <h1 className="bg-gradient-to-r from-[#323d8f] to-[#4a5bb8] bg-clip-text text-4xl font-bold text-transparent">
                {title}
            </h1>
            <p className="text-muted-foreground text-lg">{description}</p>
        </div>
    );
}

import { HTMLAttributes } from 'react';
import { cn } from '@sentinel/ui';
import { PreviewHighlight } from './preview-highlight';
import { LucideIcon } from 'lucide-react';

interface Highlight {
    label: string;
    value: string;
    icon: LucideIcon;
}

interface PreviewHighlightsListProps extends HTMLAttributes<HTMLDivElement> {
    highlights: Highlight[];
    columns?: number;
}

export function PreviewHighlightsList({
    highlights,
    className,
    columns = 4,
}: PreviewHighlightsListProps) {
    const gridColsClass =
        {
            2: 'sm:grid-cols-2',
            3: 'sm:grid-cols-3',
            4: 'sm:grid-cols-2 lg:grid-cols-4',
        }[columns] || 'sm:grid-cols-2 lg:grid-cols-4';

    return (
        <div className={cn('grid gap-x-8 gap-y-4 pt-2', gridColsClass, className)}>
            {highlights.map((item) => (
                <PreviewHighlight
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    icon={item.icon}
                />
            ))}
        </div>
    );
}

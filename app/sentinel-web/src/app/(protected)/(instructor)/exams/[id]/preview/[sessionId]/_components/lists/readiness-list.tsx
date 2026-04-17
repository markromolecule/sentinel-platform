import { CheckCircle2 } from 'lucide-react';

interface ReadinessListProps {
    items: string[];
}

export function ReadinessList({ items }: ReadinessListProps) {
    return (
        <ul className="space-y-3">
            {items.map((item) => (
                <li
                    key={item}
                    className="text-muted-foreground flex items-start gap-3 text-sm leading-6"
                >
                    <CheckCircle2 className="text-primary mt-1 h-4 w-4 shrink-0" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

'use client';

interface QuestionPanelEmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
}

export function QuestionPanelEmptyState({
    title,
    description,
    icon,
}: QuestionPanelEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            {icon ? <div className="bg-muted rounded-full p-4">{icon}</div> : null}
            <div className="space-y-1">
                <p className="text-foreground text-sm font-medium">{title}</p>
                <p className="text-muted-foreground text-xs">{description}</p>
            </div>
        </div>
    );
}

'use client';

import { Loader2 } from 'lucide-react';

interface QuestionPanelEmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    isLoading?: boolean;
}

export function QuestionPanelEmptyState({
    title,
    description,
    icon,
    isLoading = false,
}: QuestionPanelEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center min-h-[300px]">
            {isLoading ? (
                <div className="flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {icon ? <div className="bg-muted rounded-full p-4">{icon}</div> : null}
                    <div className="space-y-1">
                        <p className="text-foreground text-sm font-medium">{title}</p>
                        <p className="text-muted-foreground text-xs">{description}</p>
                    </div>
                </>
            )}
        </div>
    );
}

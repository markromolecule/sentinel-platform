import { Loader2 } from 'lucide-react';

export function StudentExamLoadingState() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-3 px-6 py-12">
            <Loader2 aria-label="Loading exam flow" className="text-primary h-6 w-6 animate-spin" />
            <p className="text-muted-foreground text-sm">Loading exam flow...</p>
        </div>
    );
}

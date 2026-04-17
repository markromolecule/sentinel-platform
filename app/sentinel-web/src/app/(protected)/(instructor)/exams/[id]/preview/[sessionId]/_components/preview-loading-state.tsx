'use client';

export function PreviewLoadingState() {
    return (
        <div className="flex min-h-[55vh] items-center justify-center px-6 py-12">
            <div className="flex flex-col items-center gap-3 text-center">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                <div className="space-y-1">
                    <p className="text-sm font-medium">Preparing preview...</p>
                    <p className="text-muted-foreground text-sm">
                        Loading exam details and configuration.
                    </p>
                </div>
            </div>
        </div>
    );
}

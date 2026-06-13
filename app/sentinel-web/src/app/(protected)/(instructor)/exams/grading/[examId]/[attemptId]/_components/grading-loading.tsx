/**
 * Renders the loading spinner and state representation.
 */
function GradingLoading() {
    return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="space-y-4 text-center">
                <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                <p className="text-muted-foreground text-sm font-medium">
                    Loading submission details...
                </p>
            </div>
        </div>
    );
}

export { GradingLoading };

/**
 * Renders the loading spinner and state representation.
 */
function GradingLoading() {
    return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="text-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                <p className="text-muted-foreground text-sm font-medium">Loading submission details...</p>
            </div>
        </div>
    );
}

export { GradingLoading };

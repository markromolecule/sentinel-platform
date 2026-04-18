export function StudentExamLoadingState() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
            <div className="text-center">
                <p className="text-sm font-medium">Loading exam flow...</p>
                <p className="text-muted-foreground mt-2 text-sm">
                    Preparing the current exam state.
                </p>
            </div>
        </div>
    );
}

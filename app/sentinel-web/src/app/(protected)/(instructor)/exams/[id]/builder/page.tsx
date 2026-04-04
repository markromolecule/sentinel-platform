import { Suspense } from "react";
import { ExamBuilderScreen } from "./_components";

export default function ExamBuilderPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center gap-3 h-screen">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading builder...</p>
            </div>
        }>
            <ExamBuilderScreen />
        </Suspense>
    );
}

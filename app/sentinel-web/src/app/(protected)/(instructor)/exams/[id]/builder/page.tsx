import { Suspense } from "react";
import { ExamBuilderScreen } from "./_components";

export default function ExamBuilderPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen text-sm text-muted-foreground">Loading builder...</div>}>
            <ExamBuilderScreen />
        </Suspense>
    );
}

import { Suspense } from "react";
import ExamsDashboardClient from "@/app/(protected)/(instructor)/exams/dashboard/page";

export default function ExamsDashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center gap-3 h-96">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">Loading exams...</p>
            </div>
        }>
            <ExamsDashboardClient />
        </Suspense>
    );
}

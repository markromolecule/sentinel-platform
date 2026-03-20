import { Suspense } from "react";
import { ExamsDashboardClient } from "@/app/(protected)/(proctor)/exams/_components/exams-dashboard-client";

export default function ExamsDashboardPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-96 text-sm text-muted-foreground">Loading exams...</div>}>
            <ExamsDashboardClient />
        </Suspense>
    );
}

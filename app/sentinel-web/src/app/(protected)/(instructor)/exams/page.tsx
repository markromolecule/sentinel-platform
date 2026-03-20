import { Suspense } from "react";
import ExamsDashboardClient from "@/app/(protected)/(instructor)/exams/dashboard/page";

export default function ExamsDashboardPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-96 text-sm text-muted-foreground">Loading exams...</div>}>
            <ExamsDashboardClient />
        </Suspense>
    );
}

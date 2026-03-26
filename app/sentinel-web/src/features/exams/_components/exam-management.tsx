"use client";

import { PageHeader } from "@sentinel/ui";

export function ExamManagement() {
    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Exams"
                description="Create, publish, and distribute proctored exams with full control."
            />
        </div>
    );
}

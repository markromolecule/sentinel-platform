"use client";

import { Badge, Button } from "@sentinel/ui";
import { LayoutGrid, Save } from "lucide-react";
import type { UseExamBuilderResult } from "@/app/(protected)/(instructor)/exams/[id]/builder/hooks/use-exam-builder/_types";

type ExamBuilderHeaderProps = Pick<
    UseExamBuilderResult,
    | "title"
    | "titleParam"
    | "status"
    | "isSaving"
    | "isPublishing"
    | "handleSave"
    | "handlePublish"
>;

export function ExamBuilderHeader({
    title,
    titleParam,
    status,
    isSaving,
    isPublishing,
    handleSave,
    handlePublish,
}: ExamBuilderHeaderProps) {
    return (
        <section className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">{title || titleParam}</h1>
                    <p className="text-sm text-muted-foreground">
                        Build and organize questions for this exam.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                    <Badge variant={status === "published" ? "default" : "secondary"}>
                        {status === "published" ? "Published" : "Draft"}
                    </Badge>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => void handleSave()}
                        disabled={isSaving || isPublishing}
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? "Saving..." : "Save Draft"}
                    </Button>
                    <Button
                        size="sm"
                        className="gap-2 bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                        onClick={() => void handlePublish()}
                        disabled={isSaving || isPublishing}
                    >
                        <LayoutGrid className="h-4 w-4" />
                        {isPublishing ? "Publishing..." : "Publish"}
                    </Button>
                </div>
            </div>
        </section>
    );
}

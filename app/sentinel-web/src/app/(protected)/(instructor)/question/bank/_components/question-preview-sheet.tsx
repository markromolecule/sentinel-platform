"use client";

import {
    Sheet,
    SheetContent,
    Badge,
    Separator,
} from "@sentinel/ui";
import { QuestionTableItem } from "@/app/(protected)/(instructor)/question/bank/_components/columns";

// Modular Sub-components
import {
    QuestionHeader,
    QuestionMetadataSection,
    QuestionActions,
    QuestionContentRenderer,
} from "@/app/(protected)/(instructor)/question/bank/_components/question-preview";

// Logic Hook
import { useQuestionPreview } from "@/app/(protected)/(instructor)/question/bank/_components/question-preview/use-question-preview";

interface QuestionPreviewSheetProps {
    question: QuestionTableItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: (question: QuestionTableItem) => void;
    onDuplicate?: (question: QuestionTableItem) => void;
    onDelete?: (question: QuestionTableItem) => void | Promise<void>;
}

export function QuestionPreviewSheet({
    question,
    open,
    onOpenChange,
    onEdit,
    onDuplicate,
    onDelete,
}: QuestionPreviewSheetProps) {
    const {
        timeAgo,
        difficulty,
        typeLabel,
        prompt,
        id,
        tags
    } = useQuestionPreview(question);

    if (!question) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto px-0">
                <QuestionHeader
                    typeLabel={typeLabel}
                    tags={tags}
                    prompt={prompt}
                    timeAgo={timeAgo}
                    points={question.points}
                />

                <Separator className="bg-zinc-100 dark:bg-zinc-800" />

                <div className="py-8 space-y-10 pb-32 px-8 text-left">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                                Question Configuration
                            </h4>
                            <Badge variant="outline" className="text-[10px] font-medium opacity-60">
                                ID: {id.slice(0, 8)}
                            </Badge>
                        </div>
                        <div className="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-1 border border-zinc-100/50 dark:border-zinc-800/50">
                            <QuestionContentRenderer question={question} />
                        </div>
                    </div>

                    <QuestionMetadataSection
                        difficulty={difficulty}
                        points={question.points}
                    />
                </div>

                <QuestionActions
                    onEdit={() => {
                        if (!question) {
                            return;
                        }

                        onOpenChange(false);
                        onEdit?.(question);
                    }}
                    onDuplicate={() => {
                        if (!question) {
                            return;
                        }

                        void onDuplicate?.(question);
                    }}
                    onDelete={() => {
                        if (!question) {
                            return;
                        }

                        onOpenChange(false);
                        void onDelete?.(question);
                    }}
                />
            </SheetContent>
        </Sheet>
    );
}

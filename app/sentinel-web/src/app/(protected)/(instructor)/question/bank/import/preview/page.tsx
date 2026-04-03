"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateQuestionMutation } from "@sentinel/hooks";
import { PageHeader } from "@sentinel/ui";
import { 
    Button, 
    Separator, 
    DataTable, 
    Input, 
    Label,
    Badge,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@sentinel/ui";
import { Save, ArrowLeft, CheckCircle2, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import { clearQuestionImportDraft, getQuestionImportDraft } from "@/app/(protected)/(instructor)/question/bank/import/_lib/draft-storage";
import type { ImportPreviewQuestion, QuestionImportDraft } from "@/app/(protected)/(instructor)/question/bank/import/_lib/types";

const columns: ColumnDef<ImportPreviewQuestion>[] = [
    {
        accessorKey: "prompt",
        header: "Question Text",
        cell: ({ row }) => <span className="font-medium">{row.original.prompt}</span>,
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize whitespace-nowrap">
                {row.original.type.toLowerCase().replace("_", " ")}
            </Badge>
        ),
    },
    {
        accessorKey: "difficulty",
        header: "Difficulty",
        cell: ({ row }) => (
            <span className={`text-xs font-semibold ${
                row.original.difficulty === "Easy" ? "text-green-500" :
                row.original.difficulty === "Medium" ? "text-amber-500" : "text-red-500"
            }`}>
                {row.original.difficulty}
            </span>
        ),
    },
    {
        accessorKey: "points",
        header: "Points",
        cell: ({ row }) => <span className="whitespace-nowrap font-mono">{row.original.points} pts</span>,
    },
];

export default function ImportPreviewPage() {
    const router = useRouter();
    const createQuestionMutation = useCreateQuestionMutation();
    const [draft, setDraft] = useState<QuestionImportDraft | null>(null);
    const [isDraftLoaded, setIsDraftLoaded] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [batchLabel, setBatchLabel] = useState("Imported Batch - " + new Date().toLocaleDateString());
    const [questionTags, setQuestionTags] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const nextDraft = getQuestionImportDraft();
        setDraft(nextDraft);
        setIsDraftLoaded(true);

        if (nextDraft?.batchLabel) {
            setBatchLabel(nextDraft.batchLabel);
        }
    }, []);

    const questions = draft?.questions ?? [];
    const totalPoints = useMemo(
        () => questions.reduce((accumulator, question) => accumulator + question.points, 0),
        [questions],
    );

    const handleSave = async () => {
        if (!batchLabel.trim()) {
            toast.error("Import label is required");
            return;
        }

        if (questions.length === 0) {
            toast.error("There are no questions to save.");
            return;
        }

        setIsSaving(true);
        try {
            const sharedTags = questionTags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);

            await Promise.all(
                questions.map((question) =>
                    createQuestionMutation.mutateAsync({
                        type: question.type,
                        points: question.points,
                        content: question.content,
                        tags: Array.from(new Set([...question.tags, ...sharedTags])),
                    }),
                ),
            );

            setIsSaveModalOpen(false);
            clearQuestionImportDraft();

            toast.success("Saved to Question Bank", {
                description: `${questions.length} questions from "${batchLabel}" were imported successfully.`,
                icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
            });

            router.push("/question/bank");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isDraftLoaded) {
        return null;
    }

    if (!draft) {
        return (
            <div className="flex flex-col gap-6 md:p-6 p-4 max-w-[1600px] mx-auto w-full">
                <PageHeader
                    title="No Import Preview Found"
                    description="Start from the import dialog to upload a CSV or spreadsheet before opening this preview."
                >
                    <Button variant="outline" onClick={() => router.push("/question/bank")}>
                        Return to Question Bank
                    </Button>
                </PageHeader>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4 max-w-[1600px] mx-auto w-full">
            <div className="flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.back()}
                    className="gap-2 hover:bg-zinc-100"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Selection
                </Button>

                <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full">
                    <Info className="w-3.5 h-3.5" />
                    Review these questions before saving them to the question bank.
                </div>
            </div>

            <PageHeader
                title="Preview Questions"
                description={`Found ${questions.length} questions from ${draft.sourceLabel}. Review the details below before saving.`}
            >
                <div className="flex gap-2">
                    <Button
                        onClick={() => setIsSaveModalOpen(true)}
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white min-w-[160px] rounded-xl h-11"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save to Question Bank
                    </Button>
                </div>
            </PageHeader>

            <Separator />

            {draft.warnings.length > 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {draft.warnings.length} row(s) were skipped during parsing. Review the file if you expected more questions.
                </div>
            ) : null}

            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Question List ({questions.length})</h3>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                        <span className="text-zinc-500">Total Points:</span>
                        <span className="text-[#323d8f]">{totalPoints}</span>
                    </div>
                </div>
            </div>

            <DataTable 
                columns={columns} 
                data={questions} 
                searchKey="prompt"
                searchPlaceholder="Filter questions..."
            />

            {/* Save Import Modal */}
            <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Save className="w-5 h-5 text-primary" />
                            Finalize Import
                        </DialogTitle>
                        <DialogDescription>
                            Save these {questions.length} questions into your question bank.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="batch-label" className="text-sm font-semibold">
                                Import Label
                            </Label>
                            <Input
                                id="batch-label"
                                value={batchLabel}
                                onChange={(e) => setBatchLabel(e.target.value)}
                                placeholder="e.g. Midterm Software Engineering Import"
                                className="rounded-xl h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="question-tags" className="text-sm font-semibold">
                                Tags
                            </Label>
                            <Input
                                id="question-tags"
                                value={questionTags}
                                onChange={(e) => setQuestionTags(e.target.value)}
                                placeholder="e.g. React, JavaScript, Advanced"
                                className="rounded-xl h-11"
                            />
                            <p className="text-[10px] text-zinc-500 mt-1">
                                Separate multiple tags with commas.
                            </p>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-border/50">
                            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Import Summary</h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Total Questions</span>
                                <span className="font-semibold">{questions.length}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-zinc-500">Total Points</span>
                                <span className="font-semibold">{totalPoints} pts</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsSaveModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !batchLabel.trim()}
                            className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white min-w-[120px] rounded-xl"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Confirm & Save"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

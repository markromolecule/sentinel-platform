"use client";

import { useMemo, useState } from "react";
import { Button } from "@sentinel/ui";
import { Input } from "@sentinel/ui";
import { Label } from "@sentinel/ui";
import { Textarea } from "@sentinel/ui";
import { Trash2, Plus, ArrowLeft, Copy, CheckCircle2 } from "lucide-react";
import type { ExamQuestion } from "@/features/exams/_types/exam";
import { QUESTION_TYPE_META } from "@/features/exams/_mock/question-meta";
import type { QuestionBuilderFormProps } from "./_types";
import { cn } from "@/lib/utils";

export function QuestionBuilderForm({ type, onBack, onCreate, onDuplicate }: QuestionBuilderFormProps) {
    const meta = QUESTION_TYPE_META[type];
    const Icon = meta.icon;

    const [question, setQuestion] = useState<Partial<ExamQuestion>>({
        type,
        prompt: "",
        points: 5,
        options: (type === "multiple_choice" || type === "multiple_response") ? ["Option A", "Option B"] : undefined,
        correctOption: type === "multiple_choice" ? 0 : undefined,
        correctBoolean: type === "true_false" ? true : undefined,
        acceptedAnswers: (type === "identification" || type === "enumeration") ? [""] : undefined,
        pairs: type === "matching" ? [{ left: "", right: "" }] : undefined,
    });

    const isComplete = useMemo(() => {
        if (!question.prompt) return false;
        if ((type === "multiple_choice" || type === "multiple_response") && (!question.options || question.options.some(o => !o))) return false;
        if (type === "matching" && (!question.pairs || question.pairs.some(p => !p.left || !p.right))) return false;
        if ((type === "identification" || type === "enumeration") && (!question.acceptedAnswers || question.acceptedAnswers.some(a => !a))) return false;
        return true;
    }, [question, type]);

    const handleCreate = () => {
        if (isComplete) onCreate(question as ExamQuestion);
    };

    const handleDuplicate = () => {
        if (isComplete) {
            onDuplicate(question as ExamQuestion);
            // Reset form for duplication
            setQuestion({
                type,
                prompt: "",
                points: 5,
                options: (type === "multiple_choice" || type === "multiple_response") ? ["", ""] : undefined,
                correctOption: type === "multiple_choice" ? 0 : undefined,
                correctBoolean: type === "true_false" ? true : undefined,
                acceptedAnswers: (type === "identification" || type === "enumeration") ? [""] : undefined,
                pairs: type === "matching" ? [{ left: "", right: "" }] : undefined,
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-md border border-border/60 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{meta.label}</h2>
                    <p className="text-sm text-muted-foreground">{meta.description}</p>
                </div>
            </div>

            <div className="space-y-6 rounded-lg border border-border/60 bg-background p-6">
                <div className="grid gap-3">
                    <Label className="text-sm font-medium">Question Prompt</Label>
                    <Textarea
                        placeholder="Type your question here..."
                        className="min-h-[120px]"
                        value={question.prompt}
                        onChange={(e) => setQuestion({ ...question, prompt: e.target.value })}
                    />
                </div>

                <div className="grid gap-3 max-w-[200px]">
                    <Label className="text-sm font-medium">Points</Label>
                    <Input
                        type="number"
                        value={question.points}
                        onChange={(e) => setQuestion({ ...question, points: parseInt(e.target.value) })}
                        className="h-9"
                    />
                </div>

                {(type === "multiple_choice" || type === "multiple_response") && (
                    <div className="space-y-4 pt-6 border-t border-border/60">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Answer Options</Label>
                            <span className="text-xs text-muted-foreground">Mark the correct answer(s)</span>
                        </div>
                        <div className="space-y-3">
                            {question.options?.map((option, idx) => (
                                <div key={idx} className="flex items-center gap-3 group">
                                    <Button
                                        variant={question.correctOption === idx ? "default" : "outline"}
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        onClick={() => {
                                            if (type === "multiple_choice") {
                                                setQuestion({ ...question, correctOption: idx });
                                            } else {
                                                // Simplified toggle logic for multiple response demo
                                                setQuestion({ ...question, correctOption: idx });
                                            }
                                        }}
                                    >
                                        {question.correctOption === idx && <CheckCircle2 className="h-4 w-4" />}
                                    </Button>
                                    <div className="flex-1 relative">
                                        <Input
                                            value={option}
                                            onChange={(e) => {
                                                const newOps = [...(question.options || [])];
                                                newOps[idx] = e.target.value;
                                                setQuestion({ ...question, options: newOps });
                                            }}
                                            placeholder={`Option ${idx + 1}`}
                                            className="pr-10"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => {
                                                const newOps = (question.options || []).filter((_, i) => i !== idx);
                                                setQuestion({ ...question, options: newOps });
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            className="w-full border-dashed"
                            onClick={() => setQuestion({ ...question, options: [...(question.options || []), ""] })}
                        >
                            <Plus className="h-4 w-4" /> Add Option
                        </Button>
                    </div>
                )}

                {type === "true_false" && (
                    <div className="space-y-3 pt-6 border-t border-border/60">
                        <Label className="text-sm font-medium">Correct Answer</Label>
                        <div className="flex gap-3">
                            <Button
                                variant={question.correctBoolean ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setQuestion({ ...question, correctBoolean: true })}
                            >
                                <CheckCircle2 className={cn("h-4 w-4", question.correctBoolean ? "" : "text-muted-foreground")} />
                                True
                            </Button>
                            <Button
                                variant={!question.correctBoolean ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setQuestion({ ...question, correctBoolean: false })}
                            >
                                <CheckCircle2 className={cn("h-4 w-4", !question.correctBoolean ? "" : "text-muted-foreground")} />
                                False
                            </Button>
                        </div>
                    </div>
                )}

                {(type === "identification" || type === "enumeration") && (
                    <div className="space-y-4 pt-6 border-t border-border/60">
                        <Label className="text-sm font-medium">
                            {type === "identification" ? "Accepted Answers" : "Enumerated Items"}
                        </Label>
                        <div className="space-y-3">
                            {question.acceptedAnswers?.map((ans, idx) => (
                                <div key={idx} className="flex gap-3 group">
                                    <div className="flex-1 relative">
                                        <Input
                                            placeholder={type === "identification" ? "Enter correct alternative..." : `Item ${idx + 1}`}
                                            value={ans}
                                            onChange={(e) => {
                                                const newAns = [...(question.acceptedAnswers || [])];
                                                newAns[idx] = e.target.value;
                                                setQuestion({ ...question, acceptedAnswers: newAns });
                                            }}
                                        />
                                        {idx > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => {
                                                    const newAns = (question.acceptedAnswers || []).filter((_, i) => i !== idx);
                                                    setQuestion({ ...question, acceptedAnswers: newAns });
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            className="w-full border-dashed"
                            onClick={() => setQuestion({ ...question, acceptedAnswers: [...(question.acceptedAnswers || []), ""] })}
                        >
                            <Plus className="h-4 w-4" /> Add {type === "identification" ? "Alternative" : "Item"}
                        </Button>
                    </div>
                )}

                {type === "matching" && (
                    <div className="space-y-4 pt-6 border-t border-border/60">
                        <Label className="text-sm font-medium">Matching Pairs</Label>
                        <div className="space-y-3">
                            {question.pairs?.map((pair, idx) => (
                                <div key={idx} className="flex items-center gap-3 group">
                                    <Input
                                        placeholder="Term"
                                        className="flex-1"
                                        value={pair.left}
                                        onChange={(e) => {
                                            const newPairs = [...(question.pairs || [])];
                                            newPairs[idx].left = e.target.value;
                                            setQuestion({ ...question, pairs: newPairs });
                                        }}
                                    />
                                    <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 shrink-0" />
                                    <div className="flex-1 relative flex gap-2 items-center">
                                        <Input
                                            placeholder="Definition"
                                            className="flex-1"
                                            value={pair.right}
                                            onChange={(e) => {
                                                const newPairs = [...(question.pairs || [])];
                                                newPairs[idx].right = e.target.value;
                                                setQuestion({ ...question, pairs: newPairs });
                                            }}
                                        />
                                        {idx > 0 && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => {
                                                const newPairs = (question.pairs || []).filter((_, i) => i !== idx);
                                                setQuestion({ ...question, pairs: newPairs });
                                            }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            className="w-full border-dashed"
                            onClick={() => setQuestion({ ...question, pairs: [...(question.pairs || []), { left: "", right: "" }] })}
                        >
                            <Plus className="h-4 w-4" /> Add Pair
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/60">
                <Button variant="ghost" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" /> Cancel
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        disabled={!isComplete}
                        onClick={handleDuplicate}
                    >
                        <Copy className="h-4 w-4" /> Duplicate
                    </Button>
                    <Button
                        disabled={!isComplete}
                        onClick={handleCreate}
                    >
                        Create
                    </Button>
                </div>
            </div>
        </div>
    );
}

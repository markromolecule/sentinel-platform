"use client";

import { useMemo, useState } from "react";
import { Button } from "@sentinel/ui";
import { Input } from "@sentinel/ui";
import { Label } from "@sentinel/ui";
import { Textarea } from "@sentinel/ui";
import { RadioGroup, RadioGroupItem } from "@sentinel/ui";
import { Switch } from "@sentinel/ui";
import { Trash2, Plus, ArrowLeft, Copy, CheckCircle2 } from "lucide-react";
import type { ExamQuestion, QuestionType } from "../types";
import { QUESTION_TYPE_META } from "../question-meta";

interface QuestionBuilderFormProps {
    type: QuestionType;
    onBack: () => void;
    onCreate: (question: ExamQuestion) => void;
    onDuplicate: (question: ExamQuestion) => void;
}

export const QuestionBuilderForm = ({ type, onBack, onCreate, onDuplicate }: QuestionBuilderFormProps) => {
    const meta = QUESTION_TYPE_META[type];
    const Icon = meta.icon;

    const [question, setQuestion] = useState<Partial<ExamQuestion>>({
        type,
        prompt: "",
        points: 5,
        options: type === "multiple_choice" ? ["Option A", "Option B"] : undefined,
        correctOption: type === "multiple_choice" ? 0 : undefined,
        correctBoolean: type === "true_false" ? true : undefined,
        acceptedAnswers: type === "identification" ? [""] : undefined,
    });

    const isComplete = useMemo(() => {
        if (!question.prompt) return false;
        if (type === "multiple_choice" && (!question.options || question.options.some(o => !o))) return false;
        return true;
    }, [question, type]);

    const handleCreate = () => {
        if (isComplete) onCreate(question as ExamQuestion);
    };

    const handleDuplicate = () => {
        if (isComplete) onDuplicate(question as ExamQuestion);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{meta.label} Builder</h2>
                    <p className="text-sm text-muted-foreground">{meta.description}</p>
                </div>
            </div>

            <div className="space-y-6 bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
                <div className="grid gap-3">
                    <Label className="text-base font-semibold">Question Prompt</Label>
                    <Textarea 
                        placeholder="Type your question here..." 
                        className="min-h-[120px] bg-secondary/20 border-border/50 text-lg leading-relaxed focus:ring-2 focus:ring-primary/20"
                        value={question.prompt}
                        onChange={(e) => setQuestion({ ...question, prompt: e.target.value })}
                    />
                </div>

                <div className="grid gap-3 max-w-[200px]">
                    <Label className="text-sm font-semibold">Points</Label>
                    <Input 
                        type="number" 
                        value={question.points}
                        onChange={(e) => setQuestion({ ...question, points: parseInt(e.target.value) })}
                        className="bg-secondary/20 border-border/50"
                    />
                </div>

                {type === "multiple_choice" && (
                    <div className="space-y-4 pt-4 border-t border-border/50">
                        <Label className="text-base font-semibold block mb-2">Answer Options</Label>
                        <RadioGroup 
                            value={question.correctOption?.toString()} 
                            onValueChange={(val) => setQuestion({ ...question, correctOption: parseInt(val) })}
                            className="space-y-3"
                        >
                            {question.options?.map((option, idx) => (
                                <div key={idx} className="flex items-center gap-3 group">
                                    <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} className="h-5 w-5" />
                                    <Input 
                                        value={option}
                                        onChange={(e) => {
                                            const newOps = [...(question.options || [])];
                                            newOps[idx] = e.target.value;
                                            setQuestion({ ...question, options: newOps });
                                        }}
                                        placeholder={`Option ${idx + 1}`}
                                        className="bg-secondary/10 border-border/30 group-hover:border-primary/30 transition-colors"
                                    />
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        title="Remove Option"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                            const newOps = (question.options || []).filter((_, i) => i !== idx);
                                            setQuestion({ ...question, options: newOps });
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </RadioGroup>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 border-dashed border-2 hover:border-primary hover:bg-primary/5"
                            onClick={() => setQuestion({ ...question, options: [...(question.options || []), ""] })}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Option
                        </Button>
                    </div>
                )}

                {type === "true_false" && (
                    <div className="space-y-4 pt-4 border-t border-border/50">
                        <Label className="text-base font-semibold block">Correct Answer</Label>
                        <div className="flex gap-4">
                            <Button 
                                variant={question.correctBoolean ? "default" : "outline"}
                                className="flex-1 rounded-xl h-14 text-lg font-bold"
                                onClick={() => setQuestion({ ...question, correctBoolean: true })}
                            >
                                True
                            </Button>
                            <Button 
                                variant={!question.correctBoolean ? "default" : "outline"}
                                className="flex-1 rounded-xl h-14 text-lg font-bold"
                                onClick={() => setQuestion({ ...question, correctBoolean: false })}
                            >
                                False
                            </Button>
                        </div>
                    </div>
                )}

                {type === "identification" && (
                    <div className="space-y-4 pt-4 border-t border-border/50">
                        <Label className="text-base font-semibold">Accepted Answers</Label>
                        {question.acceptedAnswers?.map((ans, idx) => (
                            <div key={idx} className="flex gap-2">
                                <Input 
                                    placeholder="Enter correct alternative..." 
                                    className="bg-secondary/10 border-border/30"
                                    value={ans}
                                    onChange={(e) => {
                                        const newAns = [...(question.acceptedAnswers || [])];
                                        newAns[idx] = e.target.value;
                                        setQuestion({ ...question, acceptedAnswers: newAns });
                                    }}
                                />
                                {idx > 0 && (
                                    <Button variant="ghost" size="icon" onClick={() => {
                                        const newAns = (question.acceptedAnswers || []).filter((_, i) => i !== idx);
                                        setQuestion({ ...question, acceptedAnswers: newAns });
                                    }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => setQuestion({ ...question, acceptedAnswers: [...(question.acceptedAnswers || []), ""] })}>
                            <Plus className="h-4 w-4 mr-2" /> Add Alternative
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50 p-6 bg-secondary/10 rounded-2xl">
                <Button variant="ghost" className="font-bold text-muted-foreground hover:text-foreground" onClick={onBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Builder
                </Button>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button 
                        variant="outline" 
                        className="flex-1 sm:flex-none font-bold border-2" 
                        disabled={!isComplete}
                        onClick={handleDuplicate}
                    >
                        <Copy className="mr-2 h-4 w-4" /> Duplicate
                    </Button>
                    <Button 
                        className="flex-1 sm:flex-none font-extrabold px-10 shadow-lg shadow-primary/20" 
                        disabled={!isComplete}
                        onClick={handleCreate}
                    >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Create
                    </Button>
                </div>
            </div>
        </div>
    );
};

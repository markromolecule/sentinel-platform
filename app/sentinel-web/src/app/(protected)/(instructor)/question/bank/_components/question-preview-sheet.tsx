"use client";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    Badge,
    Separator,
    Button,
} from "@sentinel/ui";
import { QuestionWithTags } from "./columns";
import { Edit, Copy, Trash2, Calendar, CheckCircle2, XCircle } from "lucide-react";

interface QuestionPreviewSheetProps {
    question: QuestionWithTags | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function QuestionPreviewSheet({
    question,
    open,
    onOpenChange,
}: QuestionPreviewSheetProps) {
    if (!question) return null;

    const renderContent = () => {
        const { type, content } = question;

        switch (type) {
            case "MULTIPLE_CHOICE":
                return (
                    <div className="space-y-4">
                        <p className="font-medium text-sm">Options:</p>
                        <div className="space-y-2">
                            {content.options?.map((option: string) => (
                                <div
                                    key={option}
                                    className={`flex items-center gap-2 p-3 rounded-md border ${option === content.correctAnswer
                                        ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                                        : "border-border/60"
                                        }`}
                                >
                                    {option === content.correctAnswer ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                                    )}
                                    <span className="text-sm">{option}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "TRUE_FALSE":
                return (
                    <div className="flex gap-4">
                        <div className={`flex-1 flex items-center gap-2 p-3 rounded-md border ${content.correctBoolean ? "border-green-500 bg-green-50/50" : "border-border/60"}`}>
                            {content.correctBoolean ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/30" />}
                            <span className="text-sm font-medium">True</span>
                        </div>
                        <div className={`flex-1 flex items-center gap-2 p-3 rounded-md border ${!content.correctBoolean ? "border-green-500 bg-green-50/50" : "border-border/60"}`}>
                            {!content.correctBoolean ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/30" />}
                            <span className="text-sm font-medium">False</span>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="p-4 rounded-md bg-muted/30 border border-border/50">
                        <p className="text-xs text-muted-foreground uppercase mb-1">Correct Answer:</p>
                        <p className="text-sm font-mono">{(content as any).correctAnswer || "N/A"}</p>
                    </div>
                );
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto px-0">
                <SheetHeader className="pb-6 px-8">
                    <div className="flex items-center gap-2 mb-2 pt-4">
                        <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">
                            {question.type.replace("_", " ")}
                        </Badge>
                        <div className="flex gap-1">
                            {question.tags?.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[10px] py-0 px-1 border-primary/20 bg-primary/5">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <SheetTitle className="text-xl leading-tight text-zinc-900 dark:text-zinc-50">{question.content.prompt}</SheetTitle>
                    <SheetDescription className="flex items-center gap-4 pt-2">
                        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <Calendar className="h-3.5 w-3.5" />
                            Created 2 days ago
                        </span>
                        <span className="text-xs font-semibold text-[#323d8f]">
                            {question.points} Points
                        </span>
                    </SheetDescription>
                </SheetHeader>

                <Separator className="bg-zinc-100 dark:bg-zinc-800" />

                <div className="py-8 space-y-10 pb-32 px-8">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                                Question Configuration
                            </h4>
                            <Badge variant="outline" className="text-[10px] font-medium opacity-60">
                                ID: {question.id.slice(0, 8)}
                            </Badge>
                        </div>
                        <div className="bg-zinc-50/50 dark:bg-zinc-900/30 rounded-2xl p-1 border border-zinc-100/50 dark:border-zinc-800/50">
                            {renderContent()}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">Metadata</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] text-zinc-400 font-bold uppercase">Difficulty</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                    <span className="text-sm font-medium">Medium</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-zinc-400 font-bold uppercase">Points</p>
                                <span className="text-sm font-medium">{question.points} pts</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-border/50 flex gap-3">
                    <Button className="flex-1 gap-2 bg-[#323d8f] hover:bg-[#323d8f]/90">
                        <Edit className="h-4 w-4" /> Edit Question
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                        <Copy className="h-4 w-4" /> Duplicate
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}

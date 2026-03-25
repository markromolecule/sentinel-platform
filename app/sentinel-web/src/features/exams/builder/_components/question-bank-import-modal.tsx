"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    ScrollArea,
    Input,
} from "@sentinel/ui";
import { Button, Checkbox, Badge } from "@sentinel/ui";
import { useQuestionBank } from "@/features/questions/store/use-question-bank";
import { type ExamQuestion } from "@sentinel/shared/types";
import { Search, Database, Folder, ChevronRight, LayoutGrid } from "lucide-react";
import { cn } from "@sentinel/ui";

interface QuestionBankImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (questions: ExamQuestion[]) => void;
}

export function QuestionBankImportModal({
    open,
    onOpenChange,
    onImport,
}: QuestionBankImportModalProps) {
    const { questions, collections } = useQuestionBank();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

    const filteredQuestions = questions.filter((q) => {
        const matchesSearch = q.content.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCollection = !selectedCollectionId ||
            collections.find(c => c.id === selectedCollectionId)?.questionIds.includes(q.id);

        return matchesSearch && matchesCollection;
    });

    const toggleQuestion = (id: string) => {
        setSelectedIds((prev: string[]) =>
            prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id]
        );
    };

    const handleImport = () => {
        const toImport = questions.filter((q) => selectedIds.includes(q.id)).map(q => ({
            ...q,
            examId: 'temp', // This will be handled by the parent onImport
        })) as ExamQuestion[];
        onImport(toImport);
        onOpenChange(false);
        setSelectedIds([]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-6xl w-[95vw] h-[85vh] p-0 flex flex-col overflow-hidden rounded-xl border-none shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b bg-background flex flex-col gap-1">
                    <div className="flex items-center justify-between pr-8">
                        <div className="space-y-1">
                            <DialogTitle className="text-lg font-bold flex items-center gap-2 tracking-tight transition-all">
                                <Database className="w-5 h-5 text-primary" />
                                Import from Question Bank
                            </DialogTitle>
                            <DialogDescription className="text-sm text-zinc-500 font-medium tracking-tight">
                                Browse your library and select questions for this exam.
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="px-3 py-1 font-semibold text-xs rounded-lg">
                                {selectedIds.length} Selected
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar: Collections */}
                    <div className="w-1/4 min-w-[260px] border-r border-border bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col overflow-hidden">
                        <div className="p-4 bg-background/50">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 px-1">Sources</h3>
                            <Button
                                variant={!selectedCollectionId ? "secondary" : "ghost"}
                                onClick={() => setSelectedCollectionId(null)}
                                className={cn(
                                    "w-full justify-between gap-3 h-10 px-3 rounded-xl text-sm font-semibold transition-all group",
                                    !selectedCollectionId ? "bg-white dark:bg-zinc-800 shadow-md shadow-zinc-200/50 dark:shadow-none border border-border text-primary" : "text-zinc-500 hover:text-foreground"
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    <Database className={cn("w-4 h-4", !selectedCollectionId ? "text-primary" : "text-zinc-400")} />
                                    <span>All Questions</span>
                                </div>
                                <span className={cn(
                                    "text-[10px] font-black px-1.5 py-0.5 rounded-md",
                                    !selectedCollectionId ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-400"
                                )}>
                                    {questions.length}
                                </span>
                            </Button>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-4 pt-2">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 px-1">My Collections</h3>
                                    <div className="space-y-1">
                                        {collections.map((collection) => (
                                            <Button
                                                key={collection.id}
                                                variant={selectedCollectionId === collection.id ? "secondary" : "ghost"}
                                                onClick={() => setSelectedCollectionId(collection.id)}
                                                className={cn(
                                                    "w-full justify-between gap-3 h-10 px-3 rounded-xl text-sm font-semibold transition-all group",
                                                    selectedCollectionId === collection.id ? "bg-white dark:bg-zinc-800 shadow-md shadow-zinc-200/50 dark:shadow-none border border-border text-primary" : "text-zinc-500 hover:text-foreground"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <Folder className={cn("w-4 h-4 transition-colors", selectedCollectionId === collection.id ? "text-primary" : "text-zinc-400 group-hover:text-zinc-600")} />
                                                    <span className="truncate">{collection.name}</span>
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-black px-1.5 py-0.5 rounded-md flex-shrink-0",
                                                    selectedCollectionId === collection.id ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-400"
                                                )}>
                                                    {collection.questionIds.length}
                                                </span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Main Content: Questions */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-background">
                        <div className="p-4 border-b flex flex-col gap-4 bg-background">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Search by topic, tags, or question content..."
                                    className="pl-10 h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 focus:bg-background transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                                    Showing <span className="text-zinc-900 dark:text-zinc-100">{filteredQuestions.length}</span> question{filteredQuestions.length !== 1 ? 's' : ''}
                                </p>
                                {filteredQuestions.length > 0 && (
                                    <div 
                                        className="flex items-center gap-2 cursor-pointer group select-none"
                                        onClick={() => {
                                            const allSelected = filteredQuestions.every(q => selectedIds.includes(q.id));
                                            if (allSelected) {
                                                setSelectedIds(selectedIds.filter(id => !filteredQuestions.some(q => q.id === id)));
                                            } else {
                                                const newSelected = [...new Set([...selectedIds, ...filteredQuestions.map(q => q.id)])];
                                                setSelectedIds(newSelected);
                                            }
                                        }}
                                    >
                                        <Checkbox 
                                            id="select-all"
                                            checked={filteredQuestions.length > 0 && filteredQuestions.every(q => selectedIds.includes(q.id))}
                                            onCheckedChange={() => {}} // Controlled manually by div
                                            className="rounded-md h-4 w-4 pointer-events-none"
                                        />
                                        <label htmlFor="select-all" className="text-xs font-bold text-zinc-500 group-hover:text-zinc-900 cursor-pointer transition-colors">
                                            Select Page
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-2">
                                {filteredQuestions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                                        <div className="p-4 rounded-full bg-zinc-50 dark:bg-zinc-900">
                                            <Search className="w-8 h-8 text-zinc-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No questions found</p>
                                            <p className="text-xs text-zinc-400">Adjust your criteria or try a different collection.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {filteredQuestions.map((q) => (
                                            <div
                                                key={q.id}
                                                className={cn(
                                                    "flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer group",
                                                    selectedIds.includes(q.id) 
                                                        ? "bg-primary/[0.04] border-primary/20 shadow-sm" 
                                                        : "bg-background border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/80 hover:border-zinc-200"
                                                )}
                                                onClick={() => toggleQuestion(q.id)}
                                            >
                                                <div className="pt-0.5">
                                                    <Checkbox
                                                        checked={selectedIds.includes(q.id)}
                                                        onCheckedChange={() => {}} // Controlled by parent div
                                                        className="h-5 w-5 rounded-lg data-[state=checked]:bg-primary pointer-events-none"
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 border-none px-1.5 h-4.5">
                                                            {q.type.replace('_', ' ')}
                                                        </Badge>
                                                        <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                                                            {q.points} Pts
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed pr-6">
                                                        {q.content.prompt}
                                                    </p>
                                                    {q.tags && q.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                                            {q.tags.map((tag) => (
                                                                <span key={tag} className="text-[10px] font-bold text-zinc-400 bg-zinc-100/50 px-1.5 py-0.5 rounded-md">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="self-center">
                                                    <ChevronRight className={cn("w-4 h-4 transition-all opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0", selectedIds.includes(q.id) ? "text-primary opacity-100 translate-x-0" : "text-zinc-300")} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-muted/20 flex items-center justify-end gap-3">
                    <Button 
                        variant="ghost" 
                        className="rounded-xl h-10 px-6 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-all" 
                        onClick={() => {
                            setSelectedIds([]);
                            onOpenChange(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={selectedIds.length === 0}
                        onClick={handleImport}
                        className="gap-2 rounded-xl h-10 px-8 text-sm font-bold transition-all shadow-md active:scale-95 disabled:scale-100 bg-primary hover:bg-primary/90"
                    >
                        <LayoutGrid className="h-4 w-4" />
                        <span>Import {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}Questions</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

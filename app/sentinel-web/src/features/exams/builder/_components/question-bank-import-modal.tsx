'use client';

import { useState } from 'react';
import { useQuestionsQuery } from '@sentinel/hooks';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    ScrollArea,
    Input,
} from '@sentinel/ui';
import { Button, Checkbox, Badge } from '@sentinel/ui';
import { type ExamQuestion } from '@sentinel/shared/types';
import { Search, Database, ChevronRight, LayoutGrid } from 'lucide-react';
import { cn } from '@sentinel/ui';

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
    const { data: questionRecords = [], isLoading } = useQuestionsQuery();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredQuestions = questionRecords.filter((q) => {
        const prompt = q.prompt ?? q.content.prompt;
        const matchesSearch =
            prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesSearch;
    });

    const toggleQuestion = (id: string) => {
        setSelectedIds((prev: string[]) =>
            prev.includes(id) ? prev.filter((i: string) => i !== id) : [...prev, id],
        );
    };

    const handleImport = () => {
        const toImport = questionRecords
            .filter((q) => selectedIds.includes(q.id))
            .map((q) => ({
                id: crypto.randomUUID(),
                examId: 'temp',
                sourceQuestionBankQuestionId: q.id,
                type: q.type,
                difficulty: q.difficulty,
                points: q.points,
                orderIndex: 0,
                content: q.content,
            })) as ExamQuestion[];
        onImport(toImport);
        onOpenChange(false);
        setSelectedIds([]);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[85vh] w-[95vw] flex-col overflow-hidden rounded-xl border-none p-0 shadow-2xl sm:max-w-6xl">
                {/* Header */}
                <div className="bg-background flex flex-col gap-1 border-b p-6">
                    <div className="flex items-center justify-between pr-8">
                        <div className="space-y-1">
                            <DialogTitle className="flex items-center gap-2 text-lg font-bold tracking-tight transition-all">
                                <Database className="text-primary h-5 w-5" />
                                Import from Question Bank
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium tracking-tight text-zinc-500">
                                Browse your library and select questions for this exam.
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="secondary"
                                className="rounded-lg px-3 py-1 text-xs font-semibold"
                            >
                                {selectedIds.length} Selected
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Main Content: Questions */}
                    <div className="bg-background flex flex-1 flex-col overflow-hidden">
                        <div className="bg-background flex flex-col gap-4 border-b p-4">
                            <div className="group relative">
                                <Search className="group-focus-within:text-primary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400 transition-colors" />
                                <Input
                                    placeholder="Search by topic, tags, or question content..."
                                    className="focus:bg-background h-10 rounded-xl border-zinc-200 bg-zinc-50/50 pl-10 transition-all dark:border-zinc-800"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <p className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                                    Showing{' '}
                                    <span className="text-zinc-900 dark:text-zinc-100">
                                        {filteredQuestions.length}
                                    </span>{' '}
                                    question{filteredQuestions.length !== 1 ? 's' : ''}
                                </p>
                                {filteredQuestions.length > 0 && (
                                    <div
                                        className="group flex cursor-pointer items-center gap-2 select-none"
                                        onClick={() => {
                                            const allSelected = filteredQuestions.every((q) =>
                                                selectedIds.includes(q.id),
                                            );
                                            if (allSelected) {
                                                setSelectedIds(
                                                    selectedIds.filter(
                                                        (id) =>
                                                            !filteredQuestions.some(
                                                                (q) => q.id === id,
                                                            ),
                                                    ),
                                                );
                                            } else {
                                                const newSelected = [
                                                    ...new Set([
                                                        ...selectedIds,
                                                        ...filteredQuestions.map((q) => q.id),
                                                    ]),
                                                ];
                                                setSelectedIds(newSelected);
                                            }
                                        }}
                                    >
                                        <Checkbox
                                            id="select-all"
                                            checked={
                                                filteredQuestions.length > 0 &&
                                                filteredQuestions.every((q) =>
                                                    selectedIds.includes(q.id),
                                                )
                                            }
                                            onCheckedChange={() => {}} // Controlled manually by div
                                            className="pointer-events-none h-4 w-4 rounded-md"
                                        />
                                        <label
                                            htmlFor="select-all"
                                            className="cursor-pointer text-xs font-bold text-zinc-500 transition-colors group-hover:text-zinc-900"
                                        >
                                            Select Page
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="space-y-2 p-4">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                                Loading questions
                                            </p>
                                            <p className="text-xs text-zinc-400">
                                                Fetching your question bank...
                                            </p>
                                        </div>
                                    </div>
                                ) : filteredQuestions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                                        <div className="rounded-full bg-zinc-50 p-4 dark:bg-zinc-900">
                                            <Search className="h-8 w-8 text-zinc-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                                No questions found
                                            </p>
                                            <p className="text-xs text-zinc-400">
                                                Adjust your criteria or try a different collection.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {filteredQuestions.map((q) => (
                                            <div
                                                key={q.id}
                                                className={cn(
                                                    'group flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all',
                                                    selectedIds.includes(q.id)
                                                        ? 'bg-primary/[0.04] border-primary/20 shadow-sm'
                                                        : 'bg-background border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/80 dark:border-zinc-800',
                                                )}
                                                onClick={() => toggleQuestion(q.id)}
                                            >
                                                <div className="pt-0.5">
                                                    <Checkbox
                                                        checked={selectedIds.includes(q.id)}
                                                        onCheckedChange={() => {}} // Controlled by parent div
                                                        className="data-[state=checked]:bg-primary pointer-events-none h-5 w-5 rounded-lg"
                                                    />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <Badge
                                                            variant="secondary"
                                                            className="h-4.5 border-none bg-zinc-100 px-1.5 text-[9px] font-black tracking-widest text-zinc-500 uppercase"
                                                        >
                                                            {q.type.replace('_', ' ')}
                                                        </Badge>
                                                        <span className="text-[10px] font-black tracking-widest text-zinc-300 uppercase">
                                                            {q.points} Pts
                                                        </span>
                                                    </div>
                                                    <p className="pr-6 text-sm leading-relaxed font-semibold text-zinc-900 dark:text-zinc-100">
                                                        {q.prompt ?? q.content.prompt}
                                                    </p>
                                                    {q.tags && q.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                                            {q.tags.map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="rounded-md bg-zinc-100/50 px-1.5 py-0.5 text-[10px] font-bold text-zinc-400"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="self-center">
                                                    <ChevronRight
                                                        className={cn(
                                                            'h-4 w-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100',
                                                            selectedIds.includes(q.id)
                                                                ? 'text-primary translate-x-0 opacity-100'
                                                                : 'text-zinc-300',
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="bg-muted/20 flex items-center justify-end gap-3 border-t p-4">
                    <Button
                        variant="ghost"
                        className="h-10 rounded-xl px-6 text-sm font-bold text-zinc-500 transition-all hover:text-zinc-900"
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
                        className="bg-primary hover:bg-primary/90 h-10 gap-2 rounded-xl px-8 text-sm font-bold shadow-md transition-all active:scale-95 disabled:scale-100"
                    >
                        <LayoutGrid className="h-4 w-4" />
                        <span>
                            Import {selectedIds.length > 0 ? `${selectedIds.length} ` : ''}Questions
                        </span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { Button } from "@sentinel/ui";
import { Database, Tags, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingActionBarProps {
    selectedCount: number;
    onClear: () => void;
    onAddToExam: () => void;
    onBulkEditTags: () => void;
    onDelete: () => void;
}

export function FloatingActionBar({
    selectedCount,
    onClear,
    onAddToExam,
    onBulkEditTags,
    onDelete,
}: FloatingActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
                <div className="bg-white dark:bg-zinc-900 border border-border shadow-2xl rounded-2xl p-2 flex items-center gap-2 min-w-[400px]">
                    <div className="px-4 border-r border-border mr-2 bg-primary/5 rounded-xl py-2 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                            {selectedCount}
                        </span>
                        <span className="text-sm font-semibold">Selected</span>
                    </div>

                    <div className="flex items-center gap-1 flex-1 px-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onAddToExam}
                            className="text-primary hover:bg-primary/10 gap-2 h-9 rounded-xl"
                        >
                            <Database className="h-4 w-4" />
                            Add to Exam
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBulkEditTags}
                            className="hover:bg-accent gap-2 h-9 rounded-xl"
                        >
                            <Tags className="h-4 w-4" />
                            Tags
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDelete}
                            className="text-destructive hover:bg-destructive/10 gap-2 h-9 rounded-xl"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </Button>
                    </div>

                    <div className="pl-2 border-l border-border pr-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClear}
                            className="h-8 w-8 rounded-full hover:bg-muted"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

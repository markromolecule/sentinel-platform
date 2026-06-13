'use client';

import { Button } from '@sentinel/ui';
import { Database, Tags, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingActionBarProps {
    selectedCount: number;
    onClear: () => void;
    onAddToExam: () => void;
    onBulkEditTags: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
}

export function FloatingActionBar({
    selectedCount,
    onClear,
    onAddToExam,
    onBulkEditTags,
    onDelete,
    isDeleting = false,
}: FloatingActionBarProps) {
    if (selectedCount === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
            >
                <div className="border-border flex min-w-[400px] items-center gap-2 rounded-2xl border bg-white p-2 shadow-2xl dark:bg-zinc-900">
                    <div className="border-border bg-primary/5 mr-2 flex items-center gap-2 rounded-xl border-r px-4 py-2">
                        <span className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold">
                            {selectedCount}
                        </span>
                        <span className="text-sm font-semibold">Selected</span>
                    </div>

                    <div className="flex flex-1 items-center gap-1 px-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onAddToExam}
                            disabled={isDeleting}
                            className="text-primary hover:bg-primary/10 h-9 gap-2 rounded-xl"
                        >
                            <Database className="h-4 w-4" />
                            Add to Exam
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBulkEditTags}
                            disabled={isDeleting}
                            className="hover:bg-accent h-9 gap-2 rounded-xl"
                        >
                            <Tags className="h-4 w-4" />
                            Tags
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDelete}
                            disabled={isDeleting}
                            className="text-destructive hover:bg-destructive/10 h-9 gap-2 rounded-xl"
                        >
                            <Trash2 className="h-4 w-4" />
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>

                    <div className="border-border border-l pr-1 pl-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClear}
                            className="hover:bg-muted h-8 w-8 rounded-full"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

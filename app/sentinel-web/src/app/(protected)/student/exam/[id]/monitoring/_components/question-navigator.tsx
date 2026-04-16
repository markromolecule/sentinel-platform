'use client';

import { useState } from 'react';
import { ListTodo, Flag, Check, Menu } from 'lucide-react';
import { cn } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@sentinel/ui';
import { QuestionNavigatorProps } from '@sentinel/shared/types';

// Internal component for the question list (shared between desktop and mobile)
function QuestionList({
    questions,
    currentIndex,
    answers,
    flaggedQuestions,
    onQuestionSelect,
    onClose,
}: QuestionNavigatorProps & { onClose?: () => void }) {
    return (
        <div className="grid gap-2">
            {questions.map((q, i) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = currentIndex === i;
                const isFlagged = flaggedQuestions.has(i);

                return (
                    <button
                        key={q.id}
                        onClick={() => {
                            onQuestionSelect(i);
                            onClose?.();
                        }}
                        className={cn(
                            'group flex items-center justify-between rounded-xl border p-3 text-left transition-all duration-150',
                            isCurrent
                                ? 'border-[#4752c4] bg-[#4752c4] text-white shadow-md active:scale-[0.98]'
                                : isAnswered
                                  ? 'border-green-200/50 bg-green-50/50 hover:bg-green-50'
                                  : 'bg-background border-border/50 hover:border-primary/40 hover:bg-muted/30',
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={cn(
                                    'flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-black transition-colors',
                                    isCurrent
                                        ? 'border-white/40 bg-white/20 text-white'
                                        : isAnswered
                                          ? 'border-green-500 bg-green-500 text-white shadow-sm'
                                          : 'bg-muted/50 border-border/40 text-muted-foreground/60',
                                )}
                            >
                                {i + 1}
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className={cn(
                                        'mb-0.5 text-xs leading-none font-bold',
                                        isCurrent
                                            ? 'text-white'
                                            : isAnswered
                                              ? 'font-black text-green-700'
                                              : 'text-muted-foreground/80',
                                    )}
                                >
                                    Item {i + 1}
                                </span>
                                {isAnswered && !isCurrent && (
                                    <span className="text-[8px] font-black tracking-tighter text-green-600/70 uppercase">
                                        Completed
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {isFlagged && (
                                <Flag
                                    className={cn(
                                        'h-3 w-3 fill-current',
                                        isCurrent ? 'text-white' : 'text-orange-500',
                                    )}
                                />
                            )}
                            {isAnswered && !isCurrent && (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

// Desktop sidebar navigator
function DesktopNavigator(props: QuestionNavigatorProps) {
    const { questions, answers } = props;

    return (
        <aside className="bg-muted/5 hidden h-full flex-col overflow-hidden border-l lg:col-span-3 lg:flex xl:col-span-3">
            <div className="flex flex-1 flex-col space-y-4 overflow-hidden p-4 md:p-6">
                {/* Header */}
                <div className="flex-none">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-muted-foreground flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                            <ListTodo className="text-primary h-4 w-4" />
                            I. Identification
                        </h3>
                        <span className="bg-primary/5 text-primary border-primary/10 rounded-full border px-2 py-0.5 text-[10px] font-black">
                            {Object.keys(answers).length} / {questions.length}
                        </span>
                    </div>
                </div>

                {/* Question List */}
                <div className="scrollbar-thin flex-1 overflow-y-auto pr-2">
                    <QuestionList {...props} />
                </div>
            </div>
        </aside>
    );
}

// Mobile sheet navigator
function MobileNavigatorSheet(props: QuestionNavigatorProps) {
    const { questions, answers } = props;
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed right-4 bottom-24 z-40 lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-background h-12 w-12 rounded-full border-2 shadow-lg"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Open question navigator</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85%] p-0 sm:w-[350px]">
                    <SheetHeader className="border-b px-4 py-3">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-muted-foreground flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                                <ListTodo className="text-primary h-4 w-4" />
                                I. Identification
                            </SheetTitle>
                            <span className="bg-primary/5 text-primary border-primary/10 rounded-full border px-2 py-0.5 text-[10px] font-black">
                                {Object.keys(answers).length} / {questions.length}
                            </span>
                        </div>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-4">
                        <QuestionList {...props} onClose={() => setIsOpen(false)} />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

// Main exported component
export function QuestionNavigator(props: QuestionNavigatorProps) {
    return (
        <>
            <DesktopNavigator {...props} />
            <MobileNavigatorSheet {...props} />
        </>
    );
}

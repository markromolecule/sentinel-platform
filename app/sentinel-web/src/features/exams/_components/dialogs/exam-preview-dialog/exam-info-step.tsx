'use client';

import { Info } from 'lucide-react';
import { Button, ScrollArea, cn } from '@sentinel/ui';
import { Exam } from '@sentinel/shared/types';

interface ExamInfoStepProps {
    exam: Exam;
    onStart: () => void;
    previewMode: 'web' | 'mobile';
}

export function ExamInfoStep({ exam, onStart, previewMode }: ExamInfoStepProps) {
    const questions = exam.questions || [];

    return (
        <ScrollArea className="h-full">
            <div
                className={cn(
                    'animate-in fade-in zoom-in-95 mx-auto space-y-6 duration-300 sm:space-y-8',
                    previewMode === 'mobile' ? 'p-4 pt-8 sm:p-6 sm:pt-12' : 'max-w-3xl p-5 sm:p-8',
                )}
            >
                <div
                    className={cn(
                        'grid gap-3 sm:gap-4',
                        previewMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-4',
                    )}
                >
                    <div className="flex flex-col items-center gap-1 rounded-lg border border-[#323d8f]/10 bg-gradient-to-br from-[#323d8f]/5 to-[#323d8f]/2 p-3 text-center transition-shadow hover:shadow-md sm:rounded-xl sm:p-4">
                        <span className="text-[8px] font-black tracking-[0.1em] text-[#323d8f]/70 uppercase sm:text-[9px]">
                            Questions
                        </span>
                        <span className="text-lg font-black text-[#323d8f] sm:text-2xl">
                            {questions.length}
                        </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-lg border border-[#323d8f]/10 bg-gradient-to-br from-[#323d8f]/5 to-[#323d8f]/2 p-3 text-center transition-shadow hover:shadow-md sm:rounded-xl sm:p-4">
                        <span className="text-[8px] font-black tracking-[0.1em] text-[#323d8f]/70 uppercase sm:text-[9px]">
                            Duration
                        </span>
                        <span className="text-lg font-black text-[#323d8f] sm:text-2xl">
                            {exam.duration}m
                        </span>
                    </div>
                    {previewMode !== 'mobile' && (
                        <>
                            <div className="flex flex-col items-center gap-1 rounded-lg border border-[#323d8f]/10 bg-gradient-to-br from-[#323d8f]/5 to-[#323d8f]/2 p-3 text-center transition-shadow hover:shadow-md sm:rounded-xl sm:p-4">
                                <span className="text-[8px] font-black tracking-[0.1em] text-[#323d8f]/70 uppercase sm:text-[9px]">
                                    Pass Mark
                                </span>
                                <span className="text-lg font-black text-[#323d8f] sm:text-2xl">
                                    {exam.passingScore}%
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-1 rounded-lg border border-[#323d8f]/10 bg-gradient-to-br from-[#323d8f]/5 to-[#323d8f]/2 p-3 text-center transition-shadow hover:shadow-md sm:rounded-xl sm:p-4">
                                <span className="text-[8px] font-black tracking-[0.1em] text-[#323d8f]/70 uppercase sm:text-[9px]">
                                    Subject
                                </span>
                                <span className="line-clamp-1 w-full truncate text-xs font-black text-[#323d8f] uppercase">
                                    {exam.subject}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {previewMode === 'mobile' && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex flex-col items-center gap-1 rounded-lg border border-[#323d8f]/10 bg-gradient-to-br from-[#323d8f]/5 to-[#323d8f]/2 p-3 text-center transition-shadow hover:shadow-md sm:rounded-xl sm:p-4">
                            <span className="text-[8px] font-black tracking-[0.1em] text-[#323d8f]/70 uppercase sm:text-[9px]">
                                Pass Mark
                            </span>
                            <span className="text-lg font-black text-[#323d8f]">
                                {exam.passingScore}%
                            </span>
                        </div>
                        <div className="flex flex-col items-center gap-1 rounded-lg border border-[#323d8f]/10 bg-gradient-to-br from-[#323d8f]/5 to-[#323d8f]/2 p-3 text-center transition-shadow hover:shadow-md sm:rounded-xl sm:p-4">
                            <span className="text-[8px] font-black tracking-[0.1em] text-[#323d8f]/70 uppercase sm:text-[9px]">
                                Subject
                            </span>
                            <span className="line-clamp-2 w-full truncate text-[10px] font-black text-[#323d8f] uppercase">
                                {exam.subject}
                            </span>
                        </div>
                    </div>
                )}

                {exam.room && (
                    <div className="rounded-lg border border-[#323d8f]/10 bg-gradient-to-br from-[#323d8f]/5 to-[#323d8f]/2 p-4 text-center sm:rounded-xl">
                        <span className="text-[9px] font-black tracking-[0.12em] text-[#323d8f]/70 uppercase">
                            Room
                        </span>
                        <p className="mt-1 text-sm font-black text-[#323d8f]">{exam.room}</p>
                    </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                    <div className="text-foreground flex items-center gap-2 text-sm font-bold sm:text-base">
                        <Info className="h-4 w-4 shrink-0 text-[#323d8f] sm:h-5 sm:w-5" />
                        <h2>Instructions</h2>
                    </div>
                    <div className="text-muted-foreground rounded-lg border border-blue-100 bg-blue-50 p-4 text-[12px] leading-relaxed italic sm:rounded-xl sm:p-5 sm:text-[13px]">
                        {exam.description ||
                            'No specific instructions provided for this examination.'}
                    </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 sm:gap-3 sm:pt-4">
                    <Button
                        onClick={onStart}
                        className="h-11 w-full rounded-lg bg-[#323d8f] text-xs font-black tracking-wider uppercase shadow-lg transition-all hover:bg-[#323d8f]/90 sm:h-12 sm:rounded-xl sm:text-sm"
                        disabled={questions.length === 0}
                    >
                        Start Exam Simulation
                    </Button>
                    <p className="text-muted-foreground text-center text-[8px] font-black tracking-widest uppercase sm:text-[9px]">
                        {questions.length === 0
                            ? 'Add questions before previewing'
                            : 'Answers are not recorded'}
                    </p>
                </div>
            </div>
        </ScrollArea>
    );
}

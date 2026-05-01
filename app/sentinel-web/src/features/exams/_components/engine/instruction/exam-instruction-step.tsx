'use client';

import { FileText, Shield } from 'lucide-react';

import type { ExamInstructionStepProps } from '../types';
import { isPreviewMode } from '../utils';

export function ExamInstructionStep({
    exam,
    settings,
    configuration,
    mode = 'runtime',
}: ExamInstructionStepProps) {
    const questionCount = exam.questionCount ?? exam.questions?.length ?? 0;
    const highlights = [
        `${exam.duration} minute duration`,
        `${questionCount} question${questionCount === 1 ? '' : 's'}`,
        settings?.allowReview ? 'Review allowed before submit' : 'One-pass response flow',
        configuration?.screenLock ? 'Screen lock enabled' : 'Screen lock disabled',
    ];

    return (
        <div className="flex h-full flex-col justify-between gap-8 px-6 py-6 sm:px-8 sm:py-8">
            <div className="space-y-8">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {highlights.map((highlight) => (
                        <div
                            key={highlight}
                            className="border-border/60 bg-background rounded-2xl border px-4 py-4"
                        >
                            <p className="text-foreground text-sm leading-6 font-medium">
                                {highlight}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                    <article className="border-border/60 bg-background rounded-3xl border px-5 py-5 sm:px-6 sm:py-6">
                        <div className="mb-4 flex items-center gap-2">
                            <FileText className="text-primary h-4 w-4" />
                            <h2 className="text-lg font-semibold">Before the student enters</h2>
                        </div>
                        <div className="text-muted-foreground space-y-4 text-sm leading-6">
                            <p>
                                {exam.description?.trim()
                                    ? exam.description
                                    : 'This preview lets you inspect the readiness experience without creating an actual attempt or session record.'}
                            </p>
                            <p>
                                Keep the route focused on what the student needs to understand:
                                timing, monitoring expectations, and how the system behaves once
                                they cross into the live attempt.
                            </p>
                            {isPreviewMode(mode) ? (
                                <p className="text-foreground rounded-2xl bg-slate-950 px-4 py-3 text-sm">
                                    Preview mode stays side-effect free. It mirrors runtime
                                    structure, but it never starts a session, writes progress, or
                                    submits answers.
                                </p>
                            ) : null}
                        </div>
                    </article>

                    <article className="border-border/60 bg-muted/30 rounded-3xl border px-5 py-5 sm:px-6 sm:py-6">
                        <div className="mb-4 flex items-center gap-2">
                            <Shield className="text-primary h-4 w-4" />
                            <h2 className="text-lg font-semibold">Student reminders</h2>
                        </div>
                        <ul className="text-muted-foreground space-y-3 text-sm leading-6">
                            <li>Use a stable connection before entering the live exam surface.</li>
                            <li>
                                Finish device and browser permissions during the readiness flow.
                            </li>
                            <li>
                                Expect fullscreen, camera, and microphone rules when configured.
                            </li>
                            <li>
                                Resume logic should return the learner to the same active session.
                            </li>
                        </ul>
                    </article>
                </div>
            </div>
        </div>
    );
}

'use client';

import type { ProctorExam, ExamQuestion } from '@sentinel/shared/types';
import { Button, Separator } from '@sentinel/ui';
import { ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';
import {
    buildExamExportSections,
    buildMatchingChoices,
    getExamTotalPoints,
    getExpectedAnswerCount,
} from './exam-export-utils';

type ExamPrintExportProps = {
    exam: ProctorExam;
};

function formatDate(value?: string | Date | null) {
    if (!value) {
        return 'Not set';
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return 'Not set';
    }

    return parsed.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function renderAnswerLines(count = 1) {
    return (
        <div className="mt-4 space-y-3">
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="flex items-end gap-2 text-sm">
                    <span className="text-muted-foreground w-6 shrink-0">{index + 1}.</span>
                    <div className="h-7 flex-1 border-b border-zinc-400" />
                </div>
            ))}
        </div>
    );
}

function QuestionOptions({ question }: { question: ExamQuestion }) {
    const options = question.content.options ?? [];

    if (question.type === 'TRUE_FALSE') {
        return (
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-md border border-zinc-300 px-3 py-2">A. True</div>
                <div className="rounded-md border border-zinc-300 px-3 py-2">B. False</div>
            </div>
        );
    }

    if (!options.length) {
        return renderAnswerLines();
    }

    return (
        <ol className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {options.map((option, index) => (
                <li
                    key={`${option}-${index}`}
                    className="rounded-md border border-zinc-300 px-3 py-2"
                >
                    {String.fromCharCode(65 + index)}. {option}
                </li>
            ))}
        </ol>
    );
}

function MatchingQuestion({ question }: { question: ExamQuestion }) {
    const pairs = question.content.pairs ?? [];
    const choices = buildMatchingChoices(question);

    return (
        <div className="mt-4 grid gap-5 text-sm sm:grid-cols-2">
            <div>
                <p className="mb-2 font-semibold">Column A</p>
                <ol className="space-y-2">
                    {pairs.map((pair, index) => (
                        <li key={`${pair.left}-${index}`} className="flex gap-2">
                            <span className="w-8 shrink-0 border-b border-zinc-400 text-center" />
                            <span>
                                {index + 1}. {pair.left}
                            </span>
                        </li>
                    ))}
                </ol>
            </div>
            <div>
                <p className="mb-2 font-semibold">Column B</p>
                <ol className="space-y-2">
                    {choices.map((choice, index) => (
                        <li key={`${choice}-${index}`}>
                            {String.fromCharCode(65 + index)}. {choice}
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}

function QuestionResponseArea({ question }: { question: ExamQuestion }) {
    switch (question.type) {
        case 'MULTIPLE_CHOICE':
        case 'MULTIPLE_RESPONSE':
        case 'TRUE_FALSE':
            return <QuestionOptions question={question} />;
        case 'MATCHING':
            return <MatchingQuestion question={question} />;
        case 'ESSAY':
            return renderAnswerLines(8);
        case 'ENUMERATION':
        case 'FILL_BLANK':
            return renderAnswerLines(getExpectedAnswerCount(question));
        case 'IDENTIFICATION':
        default:
            return renderAnswerLines();
    }
}

export function ExamPrintExport({ exam }: ExamPrintExportProps) {
    const sections = buildExamExportSections(exam);
    const totalPoints = getExamTotalPoints(exam);
    const questionCount = exam.questions?.length ?? exam.questionCount ?? 0;

    return (
        <div className="min-h-screen bg-zinc-100 text-zinc-950 print:bg-white">
            <style>{`
                @page { margin: 0.55in; }
                @media print {
                    body { background: white !important; }
                    .no-print { display: none !important; }
                    .print-sheet { box-shadow: none !important; max-width: none !important; padding: 0 !important; }
                    .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                }
            `}</style>

            <div className="no-print sticky top-0 z-10 border-b bg-white/95 px-4 py-3 backdrop-blur">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
                    <Button variant="outline" asChild>
                        <Link href="/exams/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Exams
                        </Link>
                    </Button>
                    <Button onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print / Save PDF
                    </Button>
                </div>
            </div>

            <main className="print-sheet mx-auto my-6 max-w-5xl bg-white px-10 py-10 shadow-sm print:my-0">
                <header className="space-y-6">
                    <div className="text-center">
                        <p className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">
                            Sentinel Examination Copy
                        </p>
                        <h1 className="mt-2 text-2xl font-bold">{exam.title}</h1>
                        <p className="mt-1 text-sm text-zinc-600">
                            {exam.subject || 'No subject assigned'}
                            {exam.section ? ` • ${exam.section}` : ''}
                        </p>
                    </div>

                    <div className="grid gap-3 border-y border-zinc-300 py-4 text-sm sm:grid-cols-4">
                        <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase">
                                Duration
                            </p>
                            <p>{exam.duration} minutes</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase">Date</p>
                            <p>{formatDate(exam.scheduledDate)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase">Items</p>
                            <p>{questionCount}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase">Points</p>
                            <p>{totalPoints || 'Not set'}</p>
                        </div>
                    </div>

                    <div className="grid gap-4 text-sm sm:grid-cols-3">
                        <label>
                            Student Name
                            <span className="mt-3 block border-b border-zinc-400" />
                        </label>
                        <label>
                            Student ID
                            <span className="mt-3 block border-b border-zinc-400" />
                        </label>
                        <label>
                            Date
                            <span className="mt-3 block border-b border-zinc-400" />
                        </label>
                    </div>
                </header>

                <Separator className="my-8" />

                {sections.length ? (
                    <div className="space-y-10">
                        {sections.map((section) => (
                            <section key={section.id} className="space-y-6">
                                <h2 className="border-b border-zinc-300 pb-2 text-lg font-bold">
                                    {section.title}
                                </h2>
                                {section.groups.map((group) => (
                                    <div key={`${section.id}-${group.type}`} className="space-y-4">
                                        <h3 className="text-sm font-bold tracking-wide text-zinc-600 uppercase">
                                            {group.label}
                                        </h3>
                                        {group.questions.map((question, index) => (
                                            <article
                                                key={question.id}
                                                className="print-break-inside-avoid rounded-md border border-zinc-300 p-4"
                                            >
                                                <div className="flex gap-3">
                                                    <span className="font-semibold">
                                                        {index + 1}.
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                                            <p className="text-sm leading-6 font-medium whitespace-pre-wrap">
                                                                {question.content.prompt}
                                                            </p>
                                                            <span className="text-xs font-semibold text-zinc-500">
                                                                {question.points} pt
                                                                {question.points === 1 ? '' : 's'}
                                                            </span>
                                                        </div>
                                                        <QuestionResponseArea question={question} />
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                ))}
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-md border border-dashed border-zinc-300 px-4 py-10 text-center text-sm text-zinc-500">
                        This exam has no questions to export yet.
                    </div>
                )}
            </main>
        </div>
    );
}

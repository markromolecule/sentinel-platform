'use client';

import type { ReactNode } from 'react';
import type { Exam, ExamConfiguration, ExamQuestion, ExamSettings } from '@sentinel/shared/types';
import {
    Badge,
    Button,
    Input,
    Progress,
    ScrollArea,
    Textarea,
    cn,
} from '@sentinel/ui';
import {
    Camera,
    Check,
    CheckCircle2,
    Clock3,
    Eye,
    FileText,
    Flag,
    Mic,
    Monitor,
    Shield,
    Smartphone,
} from 'lucide-react';

export type ExamEngineMode = 'preview' | 'runtime';
export type ExamAnswerValue =
    | string
    | number
    | boolean
    | (string | number)[]
    | Record<string, string>
    | null
    | undefined;

type HardwareStatus = 'success' | 'pending' | 'optional';

export type HardwareReadinessItem = {
    key: string;
    title: string;
    description: string;
    icon: ReactNode;
    status: HardwareStatus;
};

type ExamStageShellProps = {
    mode?: ExamEngineMode;
    eyebrow?: string;
    title: string;
    description?: string;
    main: ReactNode;
    aside?: ReactNode;
    footer?: ReactNode;
};

type ExamInstructionStepProps = {
    exam: Pick<Exam, 'title' | 'description' | 'duration' | 'questionCount' | 'questions'>;
    settings?: ExamSettings;
    configuration?: ExamConfiguration;
    mode?: ExamEngineMode;
};

type ExamPrivacyStepProps = {
    cameraRequired: boolean;
    micRequired: boolean;
    fullscreenRequired: boolean;
    monitoringEnabled: boolean;
    platform: 'desktop' | 'mobile';
    mode?: ExamEngineMode;
};

type HardwareReadinessSummaryProps = {
    items: HardwareReadinessItem[];
    activeRules: string[];
    platform: 'desktop' | 'mobile';
    mode?: ExamEngineMode;
};

type ExamLobbyPanelProps = {
    examTitle: string;
    canEnter: boolean;
    readyCount: number;
    totalChecks: number;
    reconnectLimit: number;
    mode?: ExamEngineMode;
};

type ExamAttemptShellProps = {
    title: string;
    durationMinutes: number;
    progress: number;
    questionList: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    banner?: ReactNode;
    mode?: ExamEngineMode;
};

type ExamQuestionRendererProps = {
    question: ExamQuestion;
    value: ExamAnswerValue;
    onChange: (value: ExamAnswerValue) => void;
    showCorrectAnswer?: boolean;
    mode?: ExamEngineMode;
};

function formatQuestionTypeLabel(type: ExamQuestion['type']) {
    return type.replaceAll('_', ' ');
}

function getQuestionPrompt(question: ExamQuestion) {
    return question.content.prompt || 'Question prompt unavailable.';
}

function isPreviewMode(mode: ExamEngineMode) {
    return mode === 'preview';
}

export function ExamStageShell({
    mode = 'runtime',
    eyebrow,
    title,
    description,
    main,
    aside,
    footer,
}: ExamStageShellProps) {
    return (
        <section className="flex h-full flex-col">
            <div className="border-border/60 border-b px-6 py-6 sm:px-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                        {eyebrow ? (
                            <p className="text-primary text-[11px] font-semibold tracking-[0.18em] uppercase">
                                {eyebrow}
                            </p>
                        ) : null}
                        <div className="space-y-1">
                            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
                                {title}
                            </h1>
                            {description ? (
                                <p className="text-muted-foreground max-w-3xl text-sm leading-6 sm:text-base">
                                    {description}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {isPreviewMode(mode) ? (
                        <Badge
                            variant="outline"
                            className="border-primary/20 bg-primary/5 text-primary px-3 py-1 text-[10px] tracking-[0.18em] uppercase"
                        >
                            Preview-safe
                        </Badge>
                    ) : null}
                </div>
            </div>

            <div
                className={cn(
                    'grid flex-1 gap-0',
                    aside ? 'xl:grid-cols-[minmax(0,1fr)_320px]' : 'grid-cols-1',
                )}
            >
                <div className="min-w-0">{main}</div>
                {aside ? (
                    <aside className="border-border/60 bg-muted/20 border-t xl:border-t-0 xl:border-l">
                        {aside}
                    </aside>
                ) : null}
            </div>

            {footer ? <div className="border-border/60 border-t px-6 py-4 sm:px-8">{footer}</div> : null}
        </section>
    );
}

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
                            <p className="text-foreground text-sm font-medium leading-6">
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
                                timing, monitoring expectations, and how the system behaves once they cross into the live attempt.
                            </p>
                            {isPreviewMode(mode) ? (
                                <p className="text-foreground rounded-2xl bg-slate-950 px-4 py-3 text-sm">
                                    Preview mode stays side-effect free. It mirrors runtime structure,
                                    but it never starts a session, writes progress, or submits answers.
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
                            <li>Finish device and browser permissions during the readiness flow.</li>
                            <li>Expect fullscreen, camera, and microphone rules when configured.</li>
                            <li>Resume logic should return the learner to the same active session.</li>
                        </ul>
                    </article>
                </div>
            </div>
        </div>
    );
}

export function ExamPrivacyStep({
    cameraRequired,
    micRequired,
    fullscreenRequired,
    monitoringEnabled,
    platform,
    mode = 'runtime',
}: ExamPrivacyStepProps) {
    const disclosures = [
        cameraRequired ? 'Camera access is part of the readiness check.' : 'Camera capture is not required.',
        micRequired ? 'Microphone access can be requested for the exam.' : 'Microphone capture is not required.',
        fullscreenRequired
            ? 'Fullscreen entry is enforced before the live attempt starts.'
            : 'Fullscreen entry is not enforced for this exam.',
        monitoringEnabled
            ? 'Monitoring indicators are shown for visual review in this preview.'
            : 'Monitoring indicators are intentionally muted in this preview.',
    ];

    return (
        <div className="flex h-full flex-col gap-8 px-6 py-6 sm:px-8 sm:py-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
                <article className="border-border/60 bg-background rounded-3xl border px-5 py-5 sm:px-6 sm:py-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Eye className="text-primary h-4 w-4" />
                        <h2 className="text-lg font-semibold">Privacy acknowledgement</h2>
                    </div>
                    <div className="text-muted-foreground space-y-4 text-sm leading-6">
                        <p>
                            Students should understand why device access is requested before any
                            camera or microphone stream is used. This step is the place to explain
                            monitoring scope in plain language.
                        </p>
                        <p>
                            The current preview mirrors the runtime sequence while keeping the
                            acknowledgement copy lightweight and easy to validate.
                        </p>
                    </div>
                </article>

                <article className="border-border/60 bg-muted/30 rounded-3xl border px-5 py-5 sm:px-6 sm:py-6">
                    <div className="mb-4 flex items-center gap-2">
                        {platform === 'mobile' ? (
                            <Smartphone className="text-primary h-4 w-4" />
                        ) : (
                            <Monitor className="text-primary h-4 w-4" />
                        )}
                        <h2 className="text-lg font-semibold">Current disclosure set</h2>
                    </div>
                    <ul className="text-muted-foreground space-y-3 text-sm leading-6">
                        {disclosures.map((item) => (
                            <li key={item} className="flex gap-3">
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </article>
            </div>

            {isPreviewMode(mode) ? (
                <div className="border-primary/15 bg-primary/5 rounded-3xl border px-5 py-4 text-sm leading-6 sm:px-6">
                    Adjust the preview controls to inspect how the acknowledgement changes when
                    hardware rules or monitoring indicators are toggled locally.
                </div>
            ) : null}
        </div>
    );
}

export function HardwareReadinessSummary({
    items,
    activeRules,
    platform,
    mode = 'runtime',
}: HardwareReadinessSummaryProps) {
    return (
        <div className="flex h-full flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8">
            <article className="border-border/60 bg-background rounded-3xl border overflow-hidden">
                <div className="border-border/60 flex items-center justify-between border-b px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="text-lg font-semibold">Readiness summary</h2>
                        <p className="text-muted-foreground text-sm">
                            Shared status primitives for preview and runtime.
                        </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] tracking-[0.16em] uppercase">
                        {platform === 'mobile' ? 'Mobile' : 'Desktop'}
                    </Badge>
                </div>
                <div className="divide-border/60 divide-y">
                    {items.map((item) => (
                        <div key={item.key} className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
                            <div className="flex items-start gap-3">
                                <div
                                    className={cn(
                                        'mt-0.5 rounded-2xl p-2',
                                        item.status === 'success' &&
                                            'bg-emerald-500/10 text-emerald-600',
                                        item.status === 'pending' &&
                                            'bg-amber-500/10 text-amber-600',
                                        item.status === 'optional' &&
                                            'bg-slate-500/10 text-slate-600',
                                    )}
                                >
                                    {item.icon}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">{item.title}</p>
                                    <p className="text-muted-foreground text-sm leading-6">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className={cn(
                                    'shrink-0 text-[10px] tracking-[0.16em] uppercase',
                                    item.status === 'success' &&
                                        'border-emerald-200 bg-emerald-50 text-emerald-700',
                                    item.status === 'pending' &&
                                        'border-amber-200 bg-amber-50 text-amber-700',
                                    item.status === 'optional' &&
                                        'border-slate-200 bg-slate-50 text-slate-700',
                                )}
                            >
                                {item.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            </article>

            <article className="border-border/60 bg-muted/30 rounded-3xl border px-5 py-5 sm:px-6 sm:py-6">
                <div className="mb-4 flex items-center gap-2">
                    <Shield className="text-primary h-4 w-4" />
                    <h2 className="text-lg font-semibold">Active monitoring cues</h2>
                </div>
                {activeRules.length ? (
                    <div className="flex flex-wrap gap-2">
                        {activeRules.map((rule) => (
                            <Badge key={rule} variant="secondary" className="rounded-full px-3 py-1">
                                {rule}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm leading-6">
                        Monitoring cues are muted in this preview state.
                    </p>
                )}
            </article>

            {isPreviewMode(mode) ? (
                <p className="text-muted-foreground text-sm leading-6">
                    Preview can simulate readiness outcomes without touching real permissions,
                    telemetry, or LiveKit state.
                </p>
            ) : null}
        </div>
    );
}

export function ExamLobbyPanel({
    examTitle,
    canEnter,
    readyCount,
    totalChecks,
    reconnectLimit,
    mode = 'runtime',
}: ExamLobbyPanelProps) {
    return (
        <div className="flex h-full flex-col justify-between gap-8 px-6 py-6 sm:px-8 sm:py-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
                <article className="border-border/60 bg-background rounded-3xl border px-5 py-5 sm:px-6 sm:py-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Clock3 className="text-primary h-4 w-4" />
                        <h2 className="text-lg font-semibold">Ready to enter {examTitle}</h2>
                    </div>
                    <div className="text-muted-foreground space-y-4 text-sm leading-6">
                        <p>
                            This final readiness state is where the student confirms they understand
                            the environment checks and is about to transition into the live attempt.
                        </p>
                        <p>
                            Resume behavior should send an eligible student back into the active
                            session instead of creating a duplicate attempt.
                        </p>
                    </div>
                </article>

                <article className="border-border/60 bg-muted/30 rounded-3xl border px-5 py-5 sm:px-6 sm:py-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Shield className="text-primary h-4 w-4" />
                        <h2 className="text-lg font-semibold">Gate summary</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="rounded-2xl bg-white px-4 py-4">
                            <p className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
                                Readiness
                            </p>
                            <p className="mt-2 text-2xl font-semibold">
                                {readyCount}/{totalChecks}
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-4">
                            <p className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
                                Reconnect policy
                            </p>
                            <p className="mt-2 text-sm font-medium leading-6">
                                Up to {reconnectLimit} reconnect attempt
                                {reconnectLimit === 1 ? '' : 's'} before the runtime needs to
                                escalate recovery handling.
                            </p>
                        </div>
                    </div>
                </article>
            </div>

            <div
                className={cn(
                    'rounded-3xl border px-5 py-4 text-sm leading-6 sm:px-6',
                    canEnter
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-amber-200 bg-amber-50 text-amber-800',
                )}
            >
                {canEnter
                    ? 'All required preview checks are satisfied. Entering the attempt should remain a pure simulation here.'
                    : 'Some required preview checks are still pending. The live runtime should keep the learner in readiness until those checks pass.'}
                {isPreviewMode(mode)
                    ? ' No session start happens from this route.'
                    : null}
            </div>
        </div>
    );
}

export function ExamAttemptShell({
    title,
    durationMinutes,
    progress,
    questionList,
    children,
    footer,
    banner,
    mode = 'runtime',
}: ExamAttemptShellProps) {
    return (
        <div className="flex h-full flex-col">
            <div className="border-border/60 bg-background/95 border-b px-6 py-5 backdrop-blur sm:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-primary text-[11px] font-semibold tracking-[0.18em] uppercase">
                            {isPreviewMode(mode) ? 'Attempt shell preview' : 'Live attempt'}
                        </p>
                        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
                            {title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="border-border/60 bg-muted/30 rounded-full border px-4 py-2 text-sm font-medium">
                            {durationMinutes} min
                        </div>
                        <div className="border-border/60 bg-muted/30 rounded-full border px-4 py-2 text-sm font-medium">
                            {Math.round(progress)}% complete
                        </div>
                    </div>
                </div>

                <Progress value={progress} className="mt-4 h-2" />
            </div>

            {banner ? <div className="border-border/60 border-b px-6 py-4 sm:px-8">{banner}</div> : null}

            <div className="grid flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                <ScrollArea className="min-h-0">
                    <div className="px-6 py-6 sm:px-8 sm:py-8">{children}</div>
                </ScrollArea>
                <aside className="border-border/60 bg-muted/20 border-t lg:border-t-0 lg:border-l">
                    <ScrollArea className="h-full">
                        <div className="px-5 py-5 sm:px-6 sm:py-6">{questionList}</div>
                    </ScrollArea>
                </aside>
            </div>

            {footer ? <div className="border-border/60 border-t px-6 py-4 sm:px-8">{footer}</div> : null}
        </div>
    );
}

function MultipleChoiceQuestion({
    question,
    value,
    onChange,
    showCorrectAnswer,
}: ExamQuestionRendererProps) {
    const options = question.content.options ?? [];

    return (
        <div className="grid gap-3">
            {options.map((option, index) => {
                const isSelected = value === index;
                const isCorrect = showCorrectAnswer && question.content.correctAnswer === index;

                return (
                    <button
                        key={`${question.id}:${index}`}
                        onClick={() => onChange(index)}
                        className={cn(
                            'flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition',
                            isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border/60 bg-background hover:border-primary/30 hover:bg-muted/30',
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className={cn(
                                    'flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-semibold',
                                    isSelected
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border/60 text-muted-foreground',
                                )}
                            >
                                {String.fromCharCode(65 + index)}
                            </span>
                            <span className="text-sm font-medium leading-6">{option}</span>
                        </div>

                        {isCorrect ? (
                            <span className="rounded-full bg-emerald-500 p-1 text-white">
                                <Check className="h-3 w-3" />
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}

function MultipleResponseQuestion({
    question,
    value,
    onChange,
    showCorrectAnswer,
}: ExamQuestionRendererProps) {
    const options = question.content.options ?? [];
    const selectedValues = Array.isArray(value)
        ? value.filter((item): item is number => typeof item === 'number')
        : [];
    const correctValues = Array.isArray(question.content.correctAnswer)
        ? question.content.correctAnswer.filter(
              (item): item is number => typeof item === 'number',
          )
        : [];

    const toggleOption = (optionIndex: number) => {
        if (selectedValues.includes(optionIndex)) {
            onChange(selectedValues.filter((item) => item !== optionIndex));
            return;
        }

        onChange([...selectedValues, optionIndex]);
    };

    return (
        <div className="grid gap-3">
            {options.map((option, index) => {
                const isSelected = selectedValues.includes(index);
                const isCorrect = showCorrectAnswer && correctValues.includes(index);

                return (
                    <button
                        key={`${question.id}:${index}`}
                        onClick={() => toggleOption(index)}
                        className={cn(
                            'flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition',
                            isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border/60 bg-background hover:border-primary/30 hover:bg-muted/30',
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <span
                                className={cn(
                                    'flex h-5 w-5 items-center justify-center rounded-md border',
                                    isSelected
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-border/60 bg-background',
                                )}
                            >
                                {isSelected ? <Check className="h-3 w-3" /> : null}
                            </span>
                            <span className="text-sm font-medium leading-6">{option}</span>
                        </div>

                        {isCorrect ? (
                            <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">
                                Correct
                            </Badge>
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}

function TrueFalseQuestion({ value, onChange, showCorrectAnswer, question }: ExamQuestionRendererProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {[true, false].map((option) => {
                const isSelected = value === option;
                const isCorrect = showCorrectAnswer && question.content.correctBoolean === option;

                return (
                    <Button
                        key={option ? 'true' : 'false'}
                        variant="outline"
                        className={cn(
                            'h-auto min-h-14 justify-between rounded-2xl border px-4 py-4 text-left text-sm font-semibold',
                            isSelected
                                ? 'border-primary bg-primary/5 text-foreground'
                                : 'border-border/60 bg-background hover:bg-muted/30',
                        )}
                        onClick={() => onChange(option)}
                    >
                        <span>{option ? 'True' : 'False'}</span>
                        {isCorrect ? (
                            <span className="rounded-full bg-emerald-500 p-1 text-white">
                                <Check className="h-3 w-3" />
                            </span>
                        ) : null}
                    </Button>
                );
            })}
        </div>
    );
}

function IdentificationQuestion({
    question,
    value,
    onChange,
    showCorrectAnswer,
}: ExamQuestionRendererProps) {
    const answerPreview =
        (question.content.correctAnswer as string | undefined) ??
        question.content.acceptedAnswers?.[0] ??
        'No answer key provided.';

    return (
        <div className="space-y-4">
            <Input
                value={(value as string) ?? ''}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Type the response here..."
                className="h-12 rounded-2xl"
            />
            {showCorrectAnswer ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                    <span className="font-semibold">Instructor answer key:</span> {answerPreview}
                </div>
            ) : null}
        </div>
    );
}

function EssayQuestion({ value, onChange }: ExamQuestionRendererProps) {
    return (
        <Textarea
            value={(value as string) ?? ''}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Essay response..."
            className="min-h-[180px] rounded-2xl"
        />
    );
}

function FillBlankQuestion({ question, value, onChange }: ExamQuestionRendererProps) {
    const blanks = question.content.blanks ?? [];
    const values = Array.isArray(value) ? value : blanks.map(() => '');

    const updateBlank = (index: number, nextValue: string) => {
        const nextValues = [...values];
        nextValues[index] = nextValue;
        onChange(nextValues);
    };

    return (
        <div className="grid gap-3">
            {blanks.length ? (
                blanks.map((blank, index) => (
                    <label key={`${question.id}:blank:${index}`} className="space-y-2">
                        <span className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                            Blank {index + 1}
                        </span>
                        <Input
                            value={(values[index] as string) ?? ''}
                            onChange={(event) => updateBlank(index, event.target.value)}
                            placeholder={blank || `Response ${index + 1}`}
                            className="h-12 rounded-2xl"
                        />
                    </label>
                ))
            ) : (
                <Input
                    value={(values[0] as string) ?? ''}
                    onChange={(event) => updateBlank(0, event.target.value)}
                    placeholder="Type the missing value..."
                    className="h-12 rounded-2xl"
                />
            )}
        </div>
    );
}

function MatchingQuestion({ question, value, onChange }: ExamQuestionRendererProps) {
    const pairs = question.content.pairs ?? [];
    const values = typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {};

    const updatePair = (left: string, right: string) => {
        onChange({
            ...values,
            [left]: right,
        });
    };

    return (
        <div className="grid gap-3">
            {pairs.map((pair, index) => (
                <div
                    key={`${question.id}:pair:${index}`}
                    className="border-border/60 grid gap-3 rounded-2xl border px-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                >
                    <div>
                        <p className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
                            Prompt
                        </p>
                        <p className="mt-2 text-sm font-medium">{pair.left}</p>
                    </div>
                    <label className="space-y-2">
                        <span className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
                            Match
                        </span>
                        <Input
                            value={String(values[pair.left] ?? '')}
                            onChange={(event) => updatePair(pair.left, event.target.value)}
                            placeholder={pair.right}
                            className="h-12 rounded-2xl"
                        />
                    </label>
                </div>
            ))}
        </div>
    );
}

function EnumerationQuestion({ question, value, onChange }: ExamQuestionRendererProps) {
    const blanks = question.content.acceptedAnswers ?? question.content.blanks ?? ['', '', ''];
    const values = Array.isArray(value) ? value : blanks.map(() => '');

    const updateItem = (index: number, nextValue: string) => {
        const nextValues = [...values];
        nextValues[index] = nextValue;
        onChange(nextValues);
    };

    return (
        <div className="grid gap-3">
            {blanks.map((_, index) => (
                <div key={`${question.id}:enum:${index}`} className="flex items-center gap-3">
                    <span className="text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold">
                        {index + 1}
                    </span>
                    <Input
                        value={(values[index] as string) ?? ''}
                        onChange={(event) => updateItem(index, event.target.value)}
                        placeholder={`Item ${index + 1}`}
                        className="h-12 rounded-2xl"
                    />
                </div>
            ))}
        </div>
    );
}

function UnsupportedQuestion() {
    return (
        <div className="border-border/60 bg-muted/20 rounded-2xl border border-dashed px-4 py-6 text-sm leading-6">
            This question type is not yet rendered in the shared attempt engine.
        </div>
    );
}

export function ExamQuestionRenderer({
    question,
    value,
    onChange,
    showCorrectAnswer = false,
    mode = 'runtime',
}: ExamQuestionRendererProps) {
    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge variant="outline" className="px-3 py-1 text-[10px] tracking-[0.16em] uppercase">
                    {formatQuestionTypeLabel(question.type)}
                </Badge>
                {isPreviewMode(mode) ? (
                    <Badge variant="secondary" className="px-3 py-1 text-[10px] tracking-[0.16em] uppercase">
                        Shared renderer
                    </Badge>
                ) : null}
            </div>

            <div className="space-y-3">
                <h2 className="text-foreground text-xl font-semibold leading-8 sm:text-2xl">
                    {getQuestionPrompt(question)}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {question.points} point{question.points === 1 ? '' : 's'}
                </p>
            </div>

            {question.type === 'MULTIPLE_CHOICE' ? (
                <MultipleChoiceQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                    showCorrectAnswer={showCorrectAnswer}
                />
            ) : question.type === 'MULTIPLE_RESPONSE' ? (
                <MultipleResponseQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                    showCorrectAnswer={showCorrectAnswer}
                />
            ) : question.type === 'TRUE_FALSE' ? (
                <TrueFalseQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                    showCorrectAnswer={showCorrectAnswer}
                />
            ) : question.type === 'IDENTIFICATION' ? (
                <IdentificationQuestion
                    question={question}
                    value={value}
                    onChange={onChange}
                    showCorrectAnswer={showCorrectAnswer}
                />
            ) : question.type === 'ESSAY' ? (
                <EssayQuestion question={question} value={value} onChange={onChange} />
            ) : question.type === 'FILL_BLANK' ? (
                <FillBlankQuestion question={question} value={value} onChange={onChange} />
            ) : question.type === 'MATCHING' ? (
                <MatchingQuestion question={question} value={value} onChange={onChange} />
            ) : question.type === 'ENUMERATION' ? (
                <EnumerationQuestion question={question} value={value} onChange={onChange} />
            ) : (
                <UnsupportedQuestion />
            )}

            {question.tags.length ? (
                <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag) => (
                        <Badge key={`${question.id}:${tag}`} variant="secondary">
                            {tag}
                        </Badge>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

export function buildHardwareReadinessItems(args: {
    cameraRequired: boolean;
    micRequired: boolean;
    cameraReady: boolean;
    micReady: boolean;
    fullscreenRequired: boolean;
    platform: 'desktop' | 'mobile';
}): HardwareReadinessItem[] {
    const platformLabel = args.platform === 'mobile' ? 'Mobile device' : 'Desktop browser';

    return [
        {
            key: 'camera',
            title: 'Camera access',
            description: args.cameraRequired
                ? args.cameraReady
                    ? 'Preview camera check is marked ready.'
                    : 'Camera is required before the student can continue.'
                : 'Camera is optional for this configuration.',
            icon: <Camera className="h-4 w-4" />,
            status: args.cameraRequired ? (args.cameraReady ? 'success' : 'pending') : 'optional',
        },
        {
            key: 'microphone',
            title: 'Microphone access',
            description: args.micRequired
                ? args.micReady
                    ? 'Preview microphone check is marked ready.'
                    : 'Microphone is required before the student can continue.'
                : 'Microphone is optional for this configuration.',
            icon: <Mic className="h-4 w-4" />,
            status: args.micRequired ? (args.micReady ? 'success' : 'pending') : 'optional',
        },
        {
            key: 'platform',
            title: 'Platform profile',
            description: `${platformLabel} rules are active in this preview state.`,
            icon:
                args.platform === 'mobile' ? (
                    <Smartphone className="h-4 w-4" />
                ) : (
                    <Monitor className="h-4 w-4" />
                ),
            status: 'success' as const,
        },
        {
            key: 'fullscreen',
            title: 'Fullscreen policy',
            description: args.fullscreenRequired
                ? 'Fullscreen entry will be requested before the live attempt.'
                : 'Fullscreen entry is not required for this preview configuration.',
            icon: <Flag className="h-4 w-4" />,
            status: args.fullscreenRequired ? 'pending' : 'optional',
        },
    ];
}

'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCreateFeedbackMutation } from '@sentinel/hooks';
import {
    Alert,
    AlertDescription,
    AlertTitle,
    Button,
    Card,
    CardContent,
    Label,
    RadioGroup,
    RadioGroupItem,
    Separator,
    Textarea,
} from '@sentinel/ui';
import { ArrowLeft, MessageSquareHeart, Star } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useStudentExamData } from '../_hooks/use-student-exam-data';

const RATING_OPTIONS = [
    { value: '1', label: 'Bad', emoji: '😔', description: 'Difficult end to end.' },
    { value: '2', label: 'Poor', emoji: '😕', description: 'Several parts got in the way.' },
    { value: '3', label: 'Fair', emoji: '😐', description: 'Usable, with some rough spots.' },
    { value: '4', label: 'Good', emoji: '🙂', description: 'Mostly smooth with minor friction.' },
    { value: '5', label: 'Excellent', emoji: '❤️', description: 'Smooth, clear, and dependable.' },
] as const;

export default function StudentExamFeedbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { examId, exam } = useStudentExamData();
    const attemptId = searchParams.get('attemptId');
    const [rating, setRating] = useState('');
    const [experience, setExperience] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);

    const duplicateRedirectHref = useMemo(
        () => `/student/exam/${examId}/feedback/thank-you?attemptId=${attemptId ?? ''}`,
        [attemptId, examId],
    );
    const selectedRatingOption = RATING_OPTIONS.find((option) => option.value === rating) ?? null;

    const createFeedbackMutation = useCreateFeedbackMutation({
        onSuccess: async () => {
            toast.success('Thanks for sharing your feedback.');
            router.replace(duplicateRedirectHref);
        },
        onError: (error) => {
            if (error.message.toLowerCase().includes('already been submitted')) {
                router.replace(duplicateRedirectHref);
                return;
            }

            toast.error(error.message || 'Failed to submit feedback.');
        },
    });

    const handleSubmit = () => {
        if (!attemptId) {
            setValidationError('Attempt information is missing. Return to your exam history.');
            return;
        }

        if (!rating) {
            setValidationError('Please select a rating before submitting your feedback.');
            return;
        }

        setValidationError(null);
        createFeedbackMutation.mutate({
            attemptId,
            rating: Number(rating),
            experience: experience.trim() ? experience.trim() : null,
        });
    };

    return (
        <div className="bg-background flex h-[calc(100dvh-5rem)] w-full items-center justify-center overflow-hidden px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
            <Card className="border-border/70 bg-background max-h-full w-full max-w-[480px] gap-0 overflow-y-auto rounded-3xl border py-0 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                <div className="border-border/60 bg-muted/20 border-b px-5 py-3.5 sm:px-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                            <MessageSquareHeart className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-px">
                            <p className="text-foreground truncate text-[15px] leading-[1.15] font-semibold">
                                {exam?.title ? exam.title : 'Post-exam experience'}
                            </p>
                            <p className="text-muted-foreground text-[11px] leading-[1.2]">
                                Share what stood out while it is still fresh.
                            </p>
                        </div>
                    </div>
                </div>

                <CardContent className="space-y-2.5 px-5 py-4 sm:px-8 sm:py-6">
                    {validationError ? (
                        <Alert variant="destructive">
                            <AlertTitle>Feedback could not be submitted</AlertTitle>
                            <AlertDescription>{validationError}</AlertDescription>
                        </Alert>
                    ) : null}

                    <div className="space-y-0.5 text-center">
                        <h1 className="text-foreground text-[1.5rem] font-semibold tracking-tight sm:text-[1.9rem]">
                            How are you feeling?
                        </h1>
                        <p className="text-muted-foreground mx-auto max-w-sm pb-3 text-[13px] leading-5 sm:pb-4 sm:text-sm">
                            Your input helps improve future exam attempts.
                        </p>
                    </div>

                    <section className="mt-3 space-y-4 pb-3">
                        <Label className="sr-only">Rating</Label>
                        <RadioGroup
                            value={rating}
                            onValueChange={setRating}
                            className="grid grid-cols-5 gap-1.5"
                        >
                            {RATING_OPTIONS.map((option) => {
                                const isSelected = rating === option.value;

                                return (
                                    <label
                                        key={option.value}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <RadioGroupItem
                                            value={option.value}
                                            id={`rating-${option.value}`}
                                            className="sr-only"
                                        />
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-2xl text-[1.45rem] transition-all sm:h-12 sm:w-12 sm:text-[1.65rem] ${
                                                isSelected
                                                    ? 'bg-primary/10 text-primary ring-primary/30 shadow-sm ring-2'
                                                    : 'bg-muted/60 hover:bg-muted'
                                            }`}
                                        >
                                            <span aria-hidden="true">{option.emoji}</span>
                                        </div>
                                        <div className="text-center">
                                            <p
                                                className={`text-[10px] leading-tight font-semibold sm:text-xs ${
                                                    isSelected
                                                        ? 'text-foreground'
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                {option.label}
                                            </p>
                                            <div className="text-muted-foreground mt-0.5 flex items-center justify-center gap-1 text-[9px] sm:text-[10px]">
                                                <Star className="h-3 w-3 fill-current" />
                                                {option.value}
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </RadioGroup>

                        <div className="bg-muted/40 rounded-2xl px-4 py-1.5 text-center">
                            <p className="text-[13px] font-medium sm:text-sm">
                                {selectedRatingOption?.label ?? 'Select a rating'}
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-[11px] sm:text-xs">
                                {selectedRatingOption?.description ??
                                    'Choose the option that best matches your exam session.'}
                            </p>
                        </div>
                    </section>

                    <Separator></Separator>
                    <section className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="experience">Experience details (optional)</Label>
                            <p className="text-muted-foreground text-xs">
                                {experience.length}/2000
                            </p>
                        </div>
                        <Textarea
                            id="experience"
                            value={experience}
                            onChange={(event) => setExperience(event.target.value)}
                            placeholder="Share anything that worked well or felt confusing during the exam flow."
                            className="border-border/60 min-h-14 resize-none rounded-2xl bg-white px-4 py-2.5 sm:min-h-16"
                            maxLength={2000}
                        />
                    </section>

                    <div className="space-y-1.5">
                        <Button
                            className="bg-foreground text-background hover:bg-foreground/90 h-11 w-full rounded-2xl text-base font-semibold"
                            onClick={handleSubmit}
                            disabled={createFeedbackMutation.isPending}
                        >
                            {createFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                        <Button asChild variant="ghost" className="h-9 w-full rounded-2xl">
                            <Link href={`/student/history/details?attemptId=${attemptId ?? ''}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Skip for now
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

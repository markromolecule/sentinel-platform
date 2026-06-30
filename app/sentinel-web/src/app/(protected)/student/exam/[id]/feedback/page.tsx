'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCreateFeedbackMutation } from '@sentinel/hooks';
import {
    Alert,
    AlertDescription,
    AlertTitle,
    Button,
    Label,
    RadioGroup,
    RadioGroupItem,
    Textarea,
} from '@sentinel/ui';
import { ArrowLeft, MessageSquareHeart, Star } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useStudentExamData } from '../_hooks/use-student-exam-data';

const RATING_OPTIONS = [
    { value: '1', label: 'Very Poor', emoji: '😣', description: 'Difficult end to end.' },
    { value: '2', label: 'Poor', emoji: '😕', description: 'Several parts got in the way.' },
    { value: '3', label: 'Fair', emoji: '😐', description: 'Usable, with some rough spots.' },
    { value: '4', label: 'Good', emoji: '🙂', description: 'Mostly smooth with minor friction.' },
    { value: '5', label: 'Excellent', emoji: '🤩', description: 'Smooth, clear, and dependable.' },
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
        <div className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full max-w-[560px] rounded-[32px] border border-border/60 bg-background shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4 sm:px-7">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <MessageSquareHeart className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-base font-semibold">Feedback</p>
                        <p className="text-muted-foreground truncate text-sm">
                            {exam?.title ? exam.title : 'Post-exam experience'}
                        </p>
                    </div>
                </div>

                <div className="space-y-6 px-5 py-6 sm:px-7 sm:py-7">
                    {validationError ? (
                        <Alert variant="destructive">
                            <AlertTitle>Feedback could not be submitted</AlertTitle>
                            <AlertDescription>{validationError}</AlertDescription>
                        </Alert>
                    ) : null}

                    <div className="space-y-2 text-center">
                        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
                            How are you feeling?
                        </h1>
                        <p className="text-muted-foreground mx-auto max-w-md text-sm leading-6 sm:text-base">
                            Your input helps us improve the exam flow for future attempts.
                        </p>
                    </div>

                    <section className="space-y-4">
                        <Label className="sr-only">Rating</Label>
                        <RadioGroup
                            value={rating}
                            onValueChange={setRating}
                            className="grid grid-cols-5 gap-2 sm:gap-3"
                        >
                            {RATING_OPTIONS.map((option) => {
                                const isSelected = rating === option.value;

                                return (
                                    <label
                                        key={option.value}
                                        className="flex flex-col items-center gap-2"
                                    >
                                        <RadioGroupItem
                                            value={option.value}
                                            id={`rating-${option.value}`}
                                            className="sr-only"
                                        />
                                        <div
                                            className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl transition-all sm:h-16 sm:w-16 sm:text-3xl ${
                                                isSelected
                                                    ? 'bg-primary/10 ring-2 ring-primary shadow-sm'
                                                    : 'bg-muted/50 hover:bg-muted'
                                            }`}
                                        >
                                            <span aria-hidden="true">{option.emoji}</span>
                                        </div>
                                        <div className="text-center">
                                            <p
                                                className={`text-xs font-semibold sm:text-sm ${
                                                    isSelected ? 'text-foreground' : 'text-muted-foreground'
                                                }`}
                                            >
                                                {option.label}
                                            </p>
                                            <div className="text-muted-foreground mt-0.5 flex items-center justify-center gap-1 text-[11px]">
                                                <Star className="h-3 w-3 fill-current" />
                                                {option.value}
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                        </RadioGroup>

                        <div className="min-h-11 rounded-2xl bg-muted/35 px-4 py-3 text-center">
                            <p className="text-sm font-medium">
                                {selectedRatingOption?.label ?? 'Select a rating'}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                                {selectedRatingOption?.description ??
                                    'Choose the option that best matches your exam session.'}
                            </p>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="experience">Experience details (optional)</Label>
                            <p className="text-muted-foreground text-xs">{experience.length}/2000</p>
                        </div>
                        <Textarea
                            id="experience"
                            value={experience}
                            onChange={(event) => setExperience(event.target.value)}
                            placeholder="Share anything that worked well or felt confusing during the exam flow."
                            className="min-h-28 resize-none rounded-2xl border-border/60 px-4 py-3"
                            maxLength={2000}
                        />
                    </section>

                    <div className="space-y-3">
                        <Button
                            className="h-12 w-full rounded-2xl text-base font-semibold"
                            onClick={handleSubmit}
                            disabled={createFeedbackMutation.isPending}
                        >
                            {createFeedbackMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                        <Button asChild variant="ghost" className="h-11 w-full rounded-2xl">
                            <Link href={`/student/history/details?attemptId=${attemptId ?? ''}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Skip for now
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
    useCreateSubjectOfferingsFromClassificationMutation,
    useSemestersQuery,
} from '@sentinel/hooks';
import {
    classificationSubjectOfferingFormSchema,
    type ClassificationSubjectOfferingFormValues,
} from '@sentinel/shared/schema';
import { type SubjectClassification } from '@sentinel/shared/types';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';

interface OfferClassificationSubjectsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    classification: SubjectClassification | null;
    institutionName?: string | null;
}

function toDefaultValues(
    classification: SubjectClassification | null,
): ClassificationSubjectOfferingFormValues {
    return {
        subject_classification_id: classification?.id ?? '',
        term_id: '',
        department_ids: [],
        course_ids: [],
        section_ids: [],
        year_levels: [],
        institution_id: classification?.institution_id ?? null,
        duplicate_strategy: 'skip_existing',
    };
}

function formatTermLabel(academicYear?: string | null, semester?: string | null) {
    if (!academicYear && !semester) {
        return 'Unnamed term';
    }

    return [academicYear, semester].filter(Boolean).join(' • ');
}

export function OfferClassificationSubjectsDialog({
    open,
    onOpenChange,
    classification,
    institutionName,
}: OfferClassificationSubjectsDialogProps) {
    const form = useForm<ClassificationSubjectOfferingFormValues>({
        resolver: zodResolver(
            classificationSubjectOfferingFormSchema,
        ) as Resolver<ClassificationSubjectOfferingFormValues>,
        defaultValues: toDefaultValues(classification),
    });

    const { data: semesters = [] } = useSemestersQuery({
        search: '',
        institutionId: classification?.institution_id ?? undefined,
        enabled: open && Boolean(classification?.institution_id),
    });

    const createOfferings = useCreateSubjectOfferingsFromClassificationMutation({
        onSuccess: (result) => {
            toast.success(
                `${result.createdCount} subject offering${
                    result.createdCount === 1 ? '' : 's'
                } created.`,
            );
            onOpenChange(false);
            form.reset(toDefaultValues(classification));
        },
    });

    useEffect(() => {
        form.reset(toDefaultValues(classification));
    }, [classification, form, open]);

    function handleOpenChange(nextOpen: boolean) {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            form.reset(toDefaultValues(classification));
        }
    }

    function onSubmit(values: ClassificationSubjectOfferingFormValues) {
        if (!classification) {
            return;
        }

        createOfferings.mutate({
            ...values,
            subject_classification_id: classification.id,
            institution_id: classification.institution_id ?? values.institution_id ?? null,
            department_ids: [],
            course_ids: [],
            section_ids: [],
            year_levels: [],
            duplicate_strategy: values.duplicate_strategy ?? 'skip_existing',
        });
    }

    const subjectCount = classification?.subjectCount ?? 0;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Offer Classification Subjects</DialogTitle>
                    <DialogDescription>
                        Create subject offerings for every subject inside this classification for a
                        selected term.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="rounded-lg border p-4">
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">
                                    {classification?.name ?? '-'}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {subjectCount} subject{subjectCount === 1 ? '' : 's'}
                                    {institutionName ? ` • ${institutionName}` : ''}
                                </p>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="term_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Term</FormLabel>
                                    <Select
                                        disabled={createOfferings.isPending}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a term" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {semesters.map((semester) => (
                                                <SelectItem key={semester.id} value={semester.id}>
                                                    {formatTermLabel(
                                                        semester.academicYear,
                                                        semester.semester,
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        This support flow offers the full classification for the
                                        selected term.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={createOfferings.isPending}
                                onClick={() => handleOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    createOfferings.isPending ||
                                    !classification ||
                                    !subjectCount ||
                                    !classification.institution_id
                                }
                                className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                            >
                                {createOfferings.isPending ? 'Creating...' : 'Create Offerings'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

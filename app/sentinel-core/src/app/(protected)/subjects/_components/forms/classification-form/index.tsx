import { Form } from '@sentinel/ui';
import { type MasterSubject, type SubjectClassification } from '@sentinel/shared/types';
import { useSubjectClassificationForm } from './hooks/use-subject-classification-form';
import { BasicInfoFields } from './sections/basic-info-fields';
import { TargetAssignmentFields } from './sections/target-assignment-fields';
import { SubjectPickerSection } from './sections/subject-picker-section';

interface ClassificationFormProps {
    classification: SubjectClassification | null;
    subjects: MasterSubject[];
    isLoadingSubjects: boolean;
    onOpenChange: (open: boolean) => void;
    open: boolean;
}

export function ClassificationForm({
    classification,
    subjects,
    isLoadingSubjects,
    onOpenChange,
    open,
}: ClassificationFormProps) {
    const { form, onSubmit, isPending } = useSubjectClassificationForm({
        classification,
        onOpenChange,
        open,
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-1 flex-col overflow-hidden"
            >
                <div className="flex-1 overflow-y-auto px-5 py-3">
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
                        <div className="space-y-5 pb-4">
                            <BasicInfoFields />
                            <TargetAssignmentFields subjects={subjects} isPending={isPending} />
                        </div>

                        <div className="min-w-0 pb-4">
                            <SubjectPickerSection
                                subjects={subjects}
                                isLoadingSubjects={isLoadingSubjects}
                                isPending={isPending}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-muted/10 flex justify-end gap-3 border-t px-5 py-4">
                    <button
                        type="button"
                        className="hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium"
                        disabled={isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-[#323d8f] px-4 py-2 text-sm font-medium text-white hover:bg-[#323d8f]/90 disabled:opacity-50"
                        disabled={isPending}
                    >
                        {isPending
                            ? classification
                                ? 'Saving...'
                                : 'Creating...'
                            : classification
                              ? 'Save Changes'
                              : 'Create Group'}
                    </button>
                </div>
            </form>
        </Form>
    );
}

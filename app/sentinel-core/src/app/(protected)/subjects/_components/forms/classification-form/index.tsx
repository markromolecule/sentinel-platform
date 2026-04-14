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
                className="flex flex-col flex-1 overflow-hidden"
            >
                <div className="flex-1 overflow-y-auto px-6 py-2">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Left Column: Configuration */}
                        <div className="lg:col-span-5 space-y-6 pb-6">
                            <BasicInfoFields />
                            <TargetAssignmentFields subjects={subjects} isPending={isPending} />
                        </div>

                        {/* Right Column: Subject Assignment */}
                        <div className="lg:col-span-7 pb-6">
                            <SubjectPickerSection
                                subjects={subjects}
                                isLoadingSubjects={isLoadingSubjects}
                                isPending={isPending}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-muted/10 flex justify-end gap-3">
                    <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted"
                        disabled={isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-[#323d8f] rounded-md hover:bg-[#323d8f]/90 disabled:opacity-50"
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

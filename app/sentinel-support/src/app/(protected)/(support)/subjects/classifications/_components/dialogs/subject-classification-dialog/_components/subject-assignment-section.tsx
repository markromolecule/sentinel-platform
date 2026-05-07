import { useFormContext } from 'react-hook-form';
import { type SubjectClassificationFormValues } from '@sentinel/shared/schema';
import { MasterSubject } from '@sentinel/shared/types';
import {
    Checkbox,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
} from '@sentinel/ui';

type SubjectAssignmentSectionProps = {
    subjectSearch: string;
    onSearchChange: (value: string) => void;
    visibleSubjects: MasterSubject[];
    selectedInstitutionId: string | null;
    toggleSelected: (
        fieldValue: string[],
        nextValue: string,
        onChange: (value: string[]) => void,
    ) => void;
};


export function SubjectAssignmentSection({
    subjectSearch,
    onSearchChange,
    visibleSubjects,
    selectedInstitutionId,
    toggleSelected,
}: SubjectAssignmentSectionProps) {
    const { control } = useFormContext<SubjectClassificationFormValues>();

    return (
        <div className="flex min-h-0 flex-col overflow-hidden rounded-md border">
            <div className="border-b p-4">
                <FormLabel>Assigned Subjects</FormLabel>
                <Input
                    value={subjectSearch}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search subjects..."
                    className="mt-2"
                />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <FormField
                    control={control}
                    name="subject_ids"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            {visibleSubjects.length === 0 ? (
                                <p className="text-muted-foreground text-sm">
                                    {selectedInstitutionId
                                        ? 'No subjects available.'
                                        : 'Select an institution first.'}
                                </p>
                            ) : (
                                visibleSubjects.map((subject) => {
                                    const subjectId = subject.id;

                                    if (!subjectId) {
                                        return null;
                                    }

                                    return (
                                        <label
                                            key={subjectId}
                                            className="flex items-start gap-3 rounded-md border p-3 text-sm"
                                        >
                                            <Checkbox
                                                checked={field.value.includes(subjectId)}
                                                onCheckedChange={() =>
                                                    toggleSelected(
                                                        field.value,
                                                        subjectId,
                                                        field.onChange,
                                                    )
                                                }
                                            />
                                            <div>
                                                <div className="font-medium">{subject.code}</div>
                                                <div className="text-muted-foreground">
                                                    {subject.title}
                                                </div>
                                            </div>
                                        </label>
                                    );
                                })
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
}

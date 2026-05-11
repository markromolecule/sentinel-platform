import { useFormContext } from 'react-hook-form';
import { type SubjectClassificationFormValues } from '@sentinel/shared/schema';
import { Course } from '@sentinel/shared/types';
import { Checkbox, FormField, FormItem, FormLabel, FormMessage } from '@sentinel/ui';

type CourseSelectionFieldProps = {
    filteredCourses: Course[];
    toggleSelected: (
        fieldValue: string[],
        nextValue: string,
        onChange: (value: string[]) => void,
    ) => void;
};

export function CourseSelectionField({
    filteredCourses,
    toggleSelected,
}: CourseSelectionFieldProps) {
    const { control } = useFormContext<SubjectClassificationFormValues>();

    return (
        <FormField
            control={control}
            name="course_ids"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Courses</FormLabel>
                    <div className="space-y-2 rounded-md border p-3">
                        {filteredCourses.length === 0 ? (
                            <p className="text-muted-foreground text-sm">
                                No courses available for the selected department.
                            </p>
                        ) : (
                            filteredCourses.map((course) => (
                                <label key={course.id} className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={field.value.includes(course.id)}
                                        onCheckedChange={() =>
                                            toggleSelected(field.value, course.id, field.onChange)
                                        }
                                    />
                                    <span>{course.code ?? course.title}</span>
                                </label>
                            ))
                        )}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

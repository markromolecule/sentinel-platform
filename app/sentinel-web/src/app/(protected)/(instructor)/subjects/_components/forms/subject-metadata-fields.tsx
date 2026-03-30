import {
    FormControl,
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
import { type SubjectMetadataFieldsProps } from "@/app/(protected)/(instructor)/subjects/_components/forms/_types";

export function SubjectMetadataFields({
    form,
    validDepartments,
    validCourses,
    validYearLevels,
    selectedSubjectCode,
}: SubjectMetadataFieldsProps) {
    if (!selectedSubjectCode) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/20 animate-in fade-in zoom-in-95 duration-200">
            <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {validDepartments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id}>
                                        {dept.code || dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="course_id"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Course</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Course" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {validCourses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.code || course.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="year_level"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Year Level</FormLabel>
                        <Select
                            onValueChange={(val) => field.onChange(Number(val))}
                            defaultValue={String(field.value || '')}
                            value={String(field.value || '')}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Year Level" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {validYearLevels.map((year) => (
                                    <SelectItem key={year} value={String(year)}>
                                        Year {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}

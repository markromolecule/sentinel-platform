import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS, DEPARTMENTS_ABBR, YEAR_LEVELS } from "@sentinel/shared/constants";
import { SubjectFormFieldsProps } from "@/app/(protected)/admin/subjects/_components/subject-form-fields/_types";

export function SubjectFormFields({ form }: SubjectFormFieldsProps) {
    return (
        <>
            <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Course Code</FormLabel>
                        <FormControl>
                            <Input placeholder="CS101" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Descriptive Title</FormLabel>
                        <FormControl>
                            <Input placeholder="Introduction to Computer Science" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Department</FormLabel>
                            <Select
                                onValueChange={(val) => {
                                    field.onChange(val);
                                }}
                                defaultValue={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Dept" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {DEPARTMENTS.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {DEPARTMENTS_ABBR[dept] || dept}
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
                    name="yearLevel"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Year Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Year" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {YEAR_LEVELS.map((year) => (
                                        <SelectItem key={year} value={year}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </>
    );
}

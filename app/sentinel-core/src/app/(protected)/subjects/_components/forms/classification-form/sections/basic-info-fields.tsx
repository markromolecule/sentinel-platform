import { useFormContext } from 'react-hook-form';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
} from '@sentinel/ui';
import { type SubjectClassificationFormValues } from '@sentinel/shared/schema';

export function BasicInfoFields() {
    const form = useFormContext<SubjectClassificationFormValues>();

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Group Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., General Subjects" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Classification Type</FormLabel>
                            <Select
                                value={field.value}
                                onValueChange={(val) => {
                                    field.onChange(val);
                                    if (val === 'GENERAL') {
                                        form.setValue('department_id', null);
                                        form.setValue('course_ids', []);
                                    }
                                }}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="GENERAL">General Subject</SelectItem>
                                    <SelectItem value="CORE">Core Subject</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <div className="mb-1 flex items-end justify-between">
                            <FormLabel>Description</FormLabel>
                            <span
                                className={`text-[11px] font-medium ${(field.value?.length ?? 0) > 90 ? 'text-destructive' : 'text-muted-foreground'}`}
                            >
                                {field.value?.length ?? 0}/100 characters
                            </span>
                        </div>
                        <FormControl>
                            <Textarea
                                rows={4}
                                className="bg-background/50 border-muted-foreground/20 focus:ring-primary/20 resize-none"
                                placeholder="Describe when this group should be used and how its subjects are shared."
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}

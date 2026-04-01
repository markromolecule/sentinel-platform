import {
    FormDescription,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
} from '@sentinel/ui';
import { type SubjectFormFieldsProps } from './_types';

export function SubjectFormFields({ form, variant = 'default' }: SubjectFormFieldsProps) {
    const isCompact = variant === 'compact';

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subject Code</FormLabel>
                        <FormControl>
                            <Input placeholder="CS101" {...field} />
                        </FormControl>
                        <FormDescription>
                            {isCompact
                                ? 'Use the official subject code.'
                                : 'Use the official code used across schedules and reports.'}
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subject Title</FormLabel>
                        <FormControl>
                            <Input placeholder="Introduction to Computer Science" {...field} />
                        </FormControl>
                        <FormDescription>
                            {isCompact
                                ? 'Use the curriculum title.'
                                : 'Keep the title clear and consistent with the curriculum.'}
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}

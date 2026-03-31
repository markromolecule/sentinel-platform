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

export function SubjectFormFields({ form }: SubjectFormFieldsProps) {
    return (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_230px] lg:items-start">
            <div className="space-y-3">
                <div className="space-y-1">
                    <p className="text-foreground text-sm font-semibold">Subject Details</p>
                    <p className="text-muted-foreground text-sm leading-5">
                        Save the reusable catalog record here. Term rollout and section assignment
                        should stay in subject offerings.
                    </p>
                </div>

                <div className="border-border/60 bg-background rounded-xl border p-4">
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
                                        Use the official code used across schedules and reports.
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
                                        <Input
                                            placeholder="Introduction to Computer Science"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Keep the title clear and consistent with the curriculum.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className="border-border/60 bg-muted/10 rounded-xl border px-4 py-3">
                <p className="text-foreground text-sm font-medium">Catalog Record</p>
                <div className="text-muted-foreground mt-3 space-y-3 text-sm leading-5">
                    <div>
                        <p className="text-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                            Creates
                        </p>
                        <p className="mt-1">
                            A shared subject code and title in the master catalog.
                        </p>
                    </div>

                    <div>
                        <p className="text-foreground text-xs font-semibold tracking-[0.16em] uppercase">
                            Reused For
                        </p>
                        <p className="mt-1">
                            Future offerings across terms, courses, year levels, and sections.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

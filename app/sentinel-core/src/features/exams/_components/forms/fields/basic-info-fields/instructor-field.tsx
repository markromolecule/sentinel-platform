import { useMemo, useState } from 'react';
import {
    Badge,
    Checkbox,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    ScrollArea,
    Input,
} from '@sentinel/ui';
import { UserCheck, Search, X } from 'lucide-react';
import type { ExamFormFieldProps } from '../_types';
import { useUsersQuery } from '@sentinel/hooks';

const labelClassName = 'text-[13px] font-bold text-foreground/70 flex items-center gap-2';

type InstructorFieldProps = ExamFormFieldProps & {
    instructorIds: string[];
};

export function InstructorField({ control, instructorIds }: InstructorFieldProps) {
    const { data: instructors = [], isLoading } = useUsersQuery({ role: 'instructor' });
    const [searchQuery, setSearchQuery] = useState('');

    const selectedInstructors = useMemo(
        () =>
            instructors
                .filter((instructor) => instructorIds.includes(instructor.id))
                .sort(
                    (left, right) =>
                        instructorIds.indexOf(left.id) - instructorIds.indexOf(right.id),
                ),
        [instructorIds, instructors],
    );

    const filteredInstructors = useMemo(() => {
        if (!searchQuery.trim()) {
            return instructors;
        }
        const query = searchQuery.toLowerCase();
        return instructors.filter(
            (instructor) =>
                instructor.firstName?.toLowerCase().includes(query) ||
                instructor.lastName?.toLowerCase().includes(query) ||
                instructor.email.toLowerCase().includes(query),
        );
    }, [instructors, searchQuery]);

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="instructorIds"
                render={({ field }) => (
                    <FormItem className="min-w-0 space-y-3">
                        <FormLabel className={`${labelClassName} justify-between`}>
                            <div className="flex items-center gap-2">
                                <UserCheck className="h-4 w-4 text-[#323d8f]/60" />
                                Assign Instructors
                            </div>
                            {selectedInstructors.length > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="h-5 border-none bg-[#323d8f]/10 px-2 py-0 text-[10px] font-bold text-[#323d8f]"
                                >
                                    {selectedInstructors.length} SELECTED
                                </Badge>
                            )}
                        </FormLabel>

                        {/* Selected Instructors Chips Preview */}
                        {selectedInstructors.length > 0 && (
                            <div className="flex max-h-[84px] flex-wrap gap-1.5 overflow-y-auto pb-1">
                                {selectedInstructors.map((instructor) => (
                                    <Badge
                                        key={instructor.id}
                                        variant="secondary"
                                        className="flex h-6 shrink-0 items-center gap-1 rounded-full border-none bg-[#323d8f]/10 py-0.5 pr-1 pl-2.5 text-[11px] font-semibold text-[#323d8f]"
                                    >
                                        <span className="max-w-[180px] truncate">
                                            {instructor.firstName} {instructor.lastName}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const nextValue = instructorIds.filter(
                                                    (id) => id !== instructor.id,
                                                );
                                                field.onChange(nextValue);
                                            }}
                                            className="rounded-full p-0.5 text-[#323d8f]/70 transition-colors hover:bg-[#323d8f]/20 hover:text-[#323d8f]"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="border-border/60 bg-muted/15 overflow-hidden rounded-xl border">
                            {/* Instructor Search Input */}
                            <div className="border-border/40 bg-background/50 relative flex items-center gap-2 border-b px-3 py-1.5">
                                <Search className="h-3.5 w-3.5 shrink-0 text-[#323d8f]/50" />
                                <Input
                                    type="text"
                                    placeholder={
                                        isLoading
                                            ? 'Loading instructors...'
                                            : 'Search instructors by name or email...'
                                    }
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="placeholder:text-muted-foreground/60 h-7 w-full border-none bg-transparent p-0 text-xs shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="text-muted-foreground/60 hover:text-foreground hover:bg-muted rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>

                            <ScrollArea className="max-h-[168px]">
                                <div className="space-y-1 px-2 py-1.5">
                                    {filteredInstructors.length === 0 ? (
                                        <div className="text-muted-foreground/80 rounded-lg px-3 py-8 text-center text-xs">
                                            {searchQuery
                                                ? 'No instructors match search query.'
                                                : 'No instructors available.'}
                                        </div>
                                    ) : (
                                        filteredInstructors.map((instructor) => {
                                            const isChecked = instructorIds.includes(instructor.id);

                                            return (
                                                <label
                                                    key={instructor.id}
                                                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                                                        isChecked
                                                            ? 'bg-[#323d8f]/5 hover:bg-[#323d8f]/10'
                                                            : 'hover:bg-muted/40'
                                                    }`}
                                                >
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => {
                                                            const nextValue = checked
                                                                ? Array.from(
                                                                      new Set([
                                                                          ...instructorIds,
                                                                          instructor.id,
                                                                      ]),
                                                                  )
                                                                : instructorIds.filter(
                                                                      (id) => id !== instructor.id,
                                                                  );

                                                            field.onChange(nextValue);
                                                        }}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <span
                                                                className={`truncate text-[13px] font-semibold ${
                                                                    isChecked
                                                                        ? 'text-[#323d8f]'
                                                                        : 'text-foreground/90'
                                                                }`}
                                                            >
                                                                {instructor.firstName}{' '}
                                                                {instructor.lastName}
                                                            </span>
                                                        </div>
                                                        <div className="text-muted-foreground/70 truncate text-[11px]">
                                                            {instructor.email}
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}

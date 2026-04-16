'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Badge } from '@sentinel/ui';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@sentinel/ui';
import { Popover, PopoverContent, PopoverTrigger } from '@sentinel/ui';
import { type SubjectSelectorProps } from '@/app/(protected)/(instructor)/subjects/_components/forms/_types';

export function SubjectSelector({
    subjects,
    selectedSubjectOfferingId,
    onSelect,
}: SubjectSelectorProps) {
    const [open, setOpen] = useState(false);

    const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectOfferingId);

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full min-w-0 justify-between"
                >
                    <span className="mr-2 flex-1 truncate text-left">
                        {selectedSubject
                            ? `${selectedSubject.subjectCode} • ${selectedSubject.termAcademicYear} ${selectedSubject.termSemester}`
                            : 'Select offered subject...'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="pointer-events-auto z-[100] w-[--radix-popover-trigger-width] p-0"
                align="start"
            >
                <Command>
                    <CommandInput placeholder="Search offered subject..." />
                    <CommandList className="max-h-[300px] overflow-x-hidden overflow-y-auto">
                        <CommandEmpty>No offered subject found.</CommandEmpty>
                        <CommandGroup>
                            {subjects.map((subject) => (
                                <CommandItem
                                    key={subject.id}
                                    value={`${subject.subjectCode} ${subject.subjectTitle} ${subject.termAcademicYear} ${subject.termSemester}`}
                                    onSelect={() => {
                                        onSelect(
                                            subject.id === selectedSubjectOfferingId
                                                ? ''
                                                : subject.id,
                                        );
                                        setOpen(false);
                                    }}
                                    className="pointer-events-auto cursor-pointer data-[disabled]:pointer-events-auto data-[disabled]:opacity-100"
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            selectedSubjectOfferingId === subject.id
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{subject.subjectCode}</span>
                                        {(subject.classifications ?? []).length > 0 && (
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                {subject.classifications?.map((classification) => (
                                                    <Badge
                                                        key={classification.id}
                                                        variant={
                                                            classification.type === 'GENERAL'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="h-5 px-1.5 text-[10px] font-medium"
                                                    >
                                                        {classification.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        <span className="text-muted-foreground text-[11px]">
                                            {subject.termAcademicYear} • {subject.termSemester}
                                        </span>
                                        <span className="text-muted-foreground text-xs">
                                            {subject.subjectTitle}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

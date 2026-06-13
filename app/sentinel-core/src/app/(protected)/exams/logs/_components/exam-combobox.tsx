'use client';

import React, { useState } from 'react';
import { Check, ChevronsUpDown, GraduationCap } from 'lucide-react';
import {
    Button,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    cn,
} from '@sentinel/ui';
import type { ProctorExam } from '@sentinel/shared/types';

export interface ExamComboboxProps {
    exams: ProctorExam[];
    selectedExamId: string;
    onSelectExam: (examId: string) => void;
    searchValue: string;
    onSearchChange: (value: string) => void;
}

export function ExamCombobox({
    exams = [],
    selectedExamId,
    onSelectExam,
    searchValue,
    onSearchChange,
}: ExamComboboxProps) {
    const [open, setOpen] = useState(false);

    const selectedExam = exams.find((exam) => exam.id === selectedExamId);

    const handleSelect = (id: string) => {
        onSelectExam(id === 'NONE' ? '' : id);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="h-10 w-full justify-between text-left font-normal sm:w-[320px]"
                >
                    <span className="truncate">
                        {selectedExam ? (
                            `${selectedExam.title} (${selectedExam.subject || 'No Subject'})`
                        ) : (
                            <span className="text-muted-foreground">Choose an exam...</span>
                        )}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 sm:w-[320px]" align="start">
                <Command filter={() => 1}>
                    <CommandInput
                        placeholder="Search exam..."
                        className="h-9"
                        value={searchValue}
                        onValueChange={onSearchChange}
                    />
                    <CommandList>
                        <CommandEmpty className="text-muted-foreground flex flex-col items-center gap-1 py-2 text-center text-sm">
                            <GraduationCap className="text-muted-foreground/60 mt-1 h-4 w-4" />
                            No exam found.
                        </CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="NONE"
                                onSelect={() => handleSelect('NONE')}
                                className="cursor-pointer"
                            >
                                <Check
                                    className={cn(
                                        'mr-2 h-4 w-4',
                                        selectedExamId === '' ? 'opacity-100' : 'opacity-0',
                                    )}
                                />
                                <span className="text-muted-foreground">Clear selection</span>
                            </CommandItem>
                            {exams.map((exam) => (
                                <CommandItem
                                    key={exam.id}
                                    value={exam.id}
                                    onSelect={() => handleSelect(exam.id)}
                                    className="cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4 shrink-0',
                                            selectedExamId === exam.id
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                        )}
                                    />
                                    <div className="flex min-w-0 flex-col">
                                        <span className="truncate font-medium">{exam.title}</span>
                                        <span className="text-muted-foreground truncate text-xs">
                                            {exam.subject || 'No Subject'}
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

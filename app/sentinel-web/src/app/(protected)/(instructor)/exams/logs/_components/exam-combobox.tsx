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
}

export function ExamCombobox({ exams = [], selectedExamId, onSelectExam }: ExamComboboxProps) {
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
                    className="w-full justify-between sm:w-[320px] rounded-xl h-10 text-left font-normal"
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
            <PopoverContent className="w-full sm:w-[320px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search exam..." className="h-9" />
                    <CommandList>
                        <CommandEmpty className="py-2 text-center text-sm text-muted-foreground flex flex-col items-center gap-1">
                            <GraduationCap className="h-4 w-4 text-muted-foreground/60 mt-1" />
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
                                        selectedExamId === '' ? 'opacity-100' : 'opacity-0'
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
                                            selectedExamId === exam.id ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium truncate">{exam.title}</span>
                                        <span className="text-xs text-muted-foreground truncate">
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

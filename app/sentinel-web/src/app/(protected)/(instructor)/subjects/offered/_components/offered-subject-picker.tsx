'use client';

import { Search, Check, GraduationCap } from 'lucide-react';
import { Input, Badge, ScrollArea, cn } from '@sentinel/ui';
import { type SubjectOffering } from '@sentinel/shared/types';

interface OfferedSubjectPickerProps {
    subjects: SubjectOffering[];
    selectedId?: string;
    onSelect: (id: string) => void;
    search: string;
    onSearchChange: (search: string) => void;
}

export function OfferedSubjectPicker({
    subjects,
    selectedId,
    onSelect,
    search,
    onSearchChange,
}: OfferedSubjectPickerProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                    placeholder="Search by code, title, or term..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            <div className="border-border/50 overflow-hidden rounded-lg border">
                <div className="bg-muted/30 border-border/50 text-muted-foreground grid grid-cols-[120px_1fr_180px_auto] gap-4 border-b px-4 py-2 text-[11px] font-semibold tracking-wider uppercase">
                    <div>Code</div>
                    <div>Title</div>
                    <div>Term</div>
                    <div className="w-8"></div>
                </div>
                <ScrollArea className="h-[400px]">
                    <div className="flex flex-col">
                        {subjects.map((subject) => {
                            const isSelected = selectedId === subject.id;
                            return (
                                <button
                                    key={subject.id}
                                    type="button"
                                    onClick={() => onSelect(subject.id)}
                                    className={cn(
                                        'border-border/40 hover:bg-accent/50 grid grid-cols-[120px_1fr_180px_auto] items-center gap-4 border-b px-4 py-3 text-left transition-colors last:border-0',
                                        isSelected ? 'bg-primary/5' : 'bg-transparent',
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                'h-5 px-1.5 text-[10px] font-bold',
                                                isSelected
                                                    ? 'border-primary/30 bg-primary/10 text-primary'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {subject.subjectCode}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-col gap-1 overflow-hidden">
                                        <span className="truncate text-sm font-medium" title={subject.subjectTitle}>
                                            {subject.subjectTitle}
                                        </span>
                                        {(subject.classifications ?? []).length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {subject.classifications?.map((classification) => (
                                                    <Badge
                                                        key={classification.id}
                                                        variant={
                                                            classification.type === 'GENERAL'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="h-3.5 px-1 text-[8px] leading-none font-medium"
                                                    >
                                                        {classification.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                        <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">
                                            {subject.termAcademicYear} • {subject.termSemester}
                                        </span>
                                    </div>

                                    <div className="flex w-8 justify-end">
                                        {isSelected && (
                                            <div className="bg-primary text-primary-foreground rounded-full p-0.5">
                                                <Check className="h-3 w-3" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                        {subjects.length === 0 && (
                            <div className="flex h-32 flex-col items-center justify-center text-center">
                                <p className="text-muted-foreground text-sm font-medium">
                                    No subjects found matching your search.
                                </p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}

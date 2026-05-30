'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCreateClassroomMutation, useSubjectOfferingsQuery, useApi } from '@sentinel/hooks';
import { assignClassroomInstructor } from '@sentinel/services';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@sentinel/ui';
import {
    Button,
    Input,
    Label,
} from '@sentinel/ui';
import { Search, ArrowLeft, ArrowRight, Check, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useAcademicScope } from '@/hooks/use-academic-scope';
import { InstructorSearchCombobox } from './instructor-search-combobox';

type CreateClassroomDialogProps = {
    open: boolean;
    onOpenChangeAction: (open: boolean) => void;
    configuredClassGroupIds: string[];
};

type SubjectOption = {
    id: string;
    label: string;
    compactLabel: string;
    code: string;
    termLabel: string;
    sections: {
        classGroupId: string;
        sectionName: string;
        yearLevelLabel: string | null;
        compactLabel: string;
    }[];
};

function formatYearLevel(yearLevel?: number | null) {
    if (!yearLevel) {
        return null;
    }

    return `Year ${yearLevel}`;
}

export function CreateClassroomDialog({
    open,
    onOpenChangeAction,
    configuredClassGroupIds,
}: CreateClassroomDialogProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [subjectSearch, setSubjectSearch] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedClassGroupId, setSelectedClassGroupId] = useState('');
    const [className, setClassName] = useState('');
    const [assignedInstructorId, setAssignedInstructorId] = useState('');

    const apiClient = useApi();
    const { institutionId } = useAcademicScope();

    const { data: subjectOfferings = [], isLoading } = useSubjectOfferingsQuery({
        institutionId: institutionId || undefined,
        visibility: 'default',
        enabled: open && Boolean(institutionId),
    });

    const createClassroomMutation = useCreateClassroomMutation({
        onSuccess: () => {
            toast.success('Classroom created successfully');
            handleClose();
        },
    });

    const [isAssigningInstructor, setIsAssigningInstructor] = useState(false);

    const subjectOptions = useMemo<SubjectOption[]>(
        () =>
            subjectOfferings
                .map((offering) => ({
                    id: offering.id,
                    code: offering.subjectCode,
                    label: `${offering.subjectCode} - ${offering.subjectTitle}`,
                    compactLabel: [offering.subjectCode, offering.subjectTitle].filter(Boolean).join(' - '),
                    termLabel: [offering.termSemester, offering.termAcademicYear]
                        .filter(Boolean)
                        .join(' • '),
                    sections: (offering.sections ?? [])
                        .filter((section) => !configuredClassGroupIds.includes(section.id))
                        .map((section) => ({
                            classGroupId: section.id,
                            sectionName: section.name,
                            yearLevelLabel: formatYearLevel(section.yearLevel),
                            compactLabel: [section.name, formatYearLevel(section.yearLevel)]
                                .filter(Boolean)
                                .join(' • '),
                        })),
                }))
                .filter((subject) => subject.sections.length > 0),
        [configuredClassGroupIds, subjectOfferings],
    );

    // Fuzzy client-side search filtering
    const filteredSubjectOptions = useMemo(() => {
        const query = subjectSearch.toLowerCase().trim();
        if (!query) {
            return subjectOptions;
        }
        return subjectOptions.filter(
            (subject) =>
                subject.code.toLowerCase().includes(query) ||
                subject.label.toLowerCase().includes(query),
        );
    }, [subjectOptions, subjectSearch]);

    const activeSubjectId = selectedSubjectId || '';
    const selectedSubject = subjectOptions.find((subject) => subject.id === activeSubjectId);

    const activeClassGroupId = useMemo(() => {
        if (!selectedSubject) {
            return '';
        }

        if (
            selectedClassGroupId &&
            selectedSubject.sections.some(
                (section) => section.classGroupId === selectedClassGroupId,
            )
        ) {
            return selectedClassGroupId;
        }

        return selectedSubject.sections[0]?.classGroupId || '';
    }, [selectedClassGroupId, selectedSubject]);

    const suggestedClassName = useMemo(() => {
        if (!selectedSubject || !activeClassGroupId) {
            return '';
        }

        const selectedSection = selectedSubject.sections.find(
            (section) => section.classGroupId === activeClassGroupId,
        );

        return `${selectedSubject.code} ${selectedSection?.sectionName ?? ''}`.trim();
    }, [activeClassGroupId, selectedSubject]);

    const selectedSection = useMemo(
        () =>
            selectedSubject?.sections.find(
                (section) => section.classGroupId === activeClassGroupId,
            ) ?? null,
        [activeClassGroupId, selectedSubject],
    );

    const handleClose = () => {
        setSelectedSubjectId('');
        setSelectedClassGroupId('');
        setClassName('');
        setAssignedInstructorId('');
        setSubjectSearch('');
        setStep(1);
        onOpenChangeAction(false);
    };

    // Reset steps and selected subject search on open
    useEffect(() => {
        if (open) {
            setStep(1);
            setSubjectSearch('');
        }
    }, [open]);

    const handleSubjectSelect = (subjectId: string) => {
        const subject = subjectOptions.find((s) => s.id === subjectId);
        if (!subject) return;

        setSelectedSubjectId(subjectId);
        if (subject.sections.length > 0) {
            setSelectedClassGroupId(subject.sections[0].classGroupId);
        }
        setStep(2);
    };

    const handleSubmit = async () => {
        const nextClassName = className.trim() || suggestedClassName;

        if (!activeClassGroupId || !nextClassName) {
            toast.error('Select a section and enter a classroom name.');
            return;
        }

        try {
            const classroom = await createClassroomMutation.mutateAsync({
                classGroupId: activeClassGroupId,
                className: nextClassName,
            });

            if (assignedInstructorId) {
                setIsAssigningInstructor(true);
                await assignClassroomInstructor(apiClient, {
                    classroomId: classroom.id,
                    instructorUserId: assignedInstructorId,
                });
            }
        } catch (error) {
            console.error('Failed to create classroom or assign instructor:', error);
        } finally {
            setIsAssigningInstructor(false);
        }
    };

    const noAvailableSections = !isLoading && subjectOptions.length === 0;

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    handleClose();
                }
            }}
        >
            <DialogContent
                className="sm:max-w-2xl"
                onPointerDownOutside={(event) => {
                    const target = event.target as HTMLElement;
                    if (target.closest('[data-slot^="combobox-"]')) {
                        event.preventDefault();
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>Create Classroom</DialogTitle>
                    <DialogDescription>
                        {step === 1
                            ? 'Choose an approved offered subject to get started.'
                            : 'Configure the section details and optional instructor for your classroom.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Stepper */}
                <div className="mb-4 pt-1">
                    <div className="flex items-center justify-between px-1">
                        <button
                            type="button"
                            onClick={() => selectedSubjectId && setStep(1)}
                            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
                            disabled={!selectedSubjectId}
                        >
                            <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-all ${step === 1
                                        ? 'bg-[#323d8f] text-white shadow-sm ring-2 ring-[#323d8f]/20'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                            >
                                {selectedSubjectId && step === 2 ? (
                                    <Check className="h-3.5 w-3.5" />
                                ) : (
                                    '1'
                                )}
                            </div>
                            <span
                                className={`text-xs font-semibold transition-colors ${step === 1
                                        ? 'text-[#323d8f]'
                                        : 'text-muted-foreground group-hover:text-foreground'
                                    }`}
                            >
                                Select Subject
                            </span>
                        </button>

                        <div className="h-[2px] flex-1 bg-muted mx-4" />

                        <div className="flex items-center gap-2">
                            <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-all ${step === 2
                                        ? 'bg-[#323d8f] text-white shadow-sm ring-2 ring-[#323d8f]/20'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                '2'
                            </div>
                            <span
                                className={`text-xs font-semibold ${step === 2 ? 'text-[#323d8f]' : 'text-muted-foreground'
                                    }`}
                            >
                                Classroom Details
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {step === 1 ? (
                        /* Step 1: Select Subject */
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search subjects by code or title..."
                                    value={subjectSearch}
                                    onChange={(e) => setSubjectSearch(e.target.value)}
                                    className="pl-9 h-10 w-full"
                                    disabled={noAvailableSections}
                                />
                            </div>

                            <div className="max-h-[380px] overflow-y-auto pr-1 space-y-2">
                                {isLoading ? (
                                    <div className="space-y-2 py-2">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="animate-pulse flex flex-col p-4 rounded-xl border border-muted bg-muted/10 space-y-2"
                                            >
                                                <div className="flex justify-between">
                                                    <div className="h-4 bg-muted rounded w-24" />
                                                    <div className="h-4 bg-muted rounded w-16" />
                                                </div>
                                                <div className="h-5 bg-muted rounded w-3/4" />
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredSubjectOptions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl text-center space-y-2">
                                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm font-semibold text-foreground">
                                            No subject offerings found
                                        </p>
                                        <p className="text-xs text-muted-foreground max-w-[280px]">
                                            {subjectSearch
                                                ? 'Try adjusting your search terms.'
                                                : 'All available subjects already have configured classrooms.'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredSubjectOptions.map((subject) => {
                                        const isSelected = selectedSubjectId === subject.id;
                                        return (
                                            <div
                                                key={subject.id}
                                                onClick={() => handleSubjectSelect(subject.id)}
                                                className={`group flex flex-col p-3.5 rounded-xl border transition-all cursor-pointer ${isSelected
                                                        ? 'border-[#323d8f] bg-[#323d8f]/5 shadow-sm'
                                                        : 'border-muted bg-background hover:bg-muted/40 hover:border-muted-foreground/30'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-muted text-muted-foreground rounded uppercase">
                                                                {subject.code}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {subject.termLabel}
                                                            </span>
                                                        </div>
                                                        <h4 className="text-sm font-semibold text-foreground group-hover:text-[#323d8f] transition-colors leading-tight">
                                                            {subject.compactLabel}
                                                        </h4>
                                                    </div>
                                                    <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                                                        {subject.sections.length}{' '}
                                                        {subject.sections.length === 1
                                                            ? 'section'
                                                            : 'sections'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t">
                                <Button variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => setStep(2)}
                                    disabled={!selectedSubjectId}
                                    className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90 gap-1.5"
                                >
                                    Next <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* Step 2: Configure Details */
                        <div className="space-y-4">
                            {selectedSubject && (
                                <div className="flex items-center justify-between p-3 rounded-xl border border-muted bg-muted/20">
                                    <div className="space-y-0.5 overflow-hidden pr-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-[9px] font-bold px-1 py-0.25 bg-muted text-muted-foreground rounded uppercase">
                                                {selectedSubject.code}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground truncate">
                                                {selectedSubject.termLabel}
                                            </span>
                                        </div>
                                        <p
                                            className="text-sm font-semibold text-foreground truncate"
                                            title={selectedSubject.label}
                                        >
                                            {selectedSubject.compactLabel}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setStep(1)}
                                        className="text-xs text-[#323d8f] hover:text-[#323d8f]/90 hover:bg-[#323d8f]/5 shrink-0 h-8"
                                    >
                                        Change
                                    </Button>
                                </div>
                            )}

                            {/* Section Chips */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-foreground">
                                    Select Section
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedSubject?.sections.map((section) => {
                                        const isSelected =
                                            activeClassGroupId === section.classGroupId;
                                        return (
                                            <button
                                                key={section.classGroupId}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedClassGroupId(section.classGroupId)
                                                }
                                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer focus:outline-none ${isSelected
                                                        ? 'bg-[#323d8f] text-white border-[#323d8f] shadow-sm'
                                                        : 'bg-background text-foreground border-muted hover:bg-muted/40 hover:border-muted-foreground/30'
                                                    }`}
                                            >
                                                {section.compactLabel}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="classroom-name"
                                    className="text-xs font-semibold text-foreground"
                                >
                                    Classroom Name
                                </Label>
                                <Input
                                    id="classroom-name"
                                    placeholder={suggestedClassName || 'e.g. CS Fundamentals - 3A'}
                                    value={className}
                                    onChange={(event) => setClassName(event.target.value)}
                                    disabled={noAvailableSections}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="classroom-instructor"
                                    className="text-xs font-semibold text-foreground"
                                >
                                    Assign Instructor (Optional)
                                </Label>
                                {institutionId && (
                                    <InstructorSearchCombobox
                                        value={assignedInstructorId}
                                        onValueChange={setAssignedInstructorId}
                                        institutionId={institutionId}
                                        disabled={noAvailableSections}
                                        placeholder="Search and select an instructor..."
                                    />
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setStep(1)}
                                    className="gap-1.5"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                                </Button>

                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleClose}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={
                                            createClassroomMutation.isPending ||
                                            isAssigningInstructor ||
                                            noAvailableSections ||
                                            !activeClassGroupId ||
                                            !(className.trim() || suggestedClassName)
                                        }
                                        className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90"
                                    >
                                        {createClassroomMutation.isPending || isAssigningInstructor
                                            ? 'Creating...'
                                            : 'Create Classroom'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}


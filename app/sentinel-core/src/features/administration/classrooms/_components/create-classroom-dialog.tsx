'use client';

import { useMemo, useState } from 'react';
import { useCreateClassroomMutation, useSubjectOfferingsQuery, useApi } from '@sentinel/hooks';
import { assignClassroomInstructor } from '@sentinel/services';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@sentinel/ui';
import {
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
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

    const activeSubjectId = selectedSubjectId || subjectOptions[0]?.id || '';
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
        onOpenChangeAction(false);
    };

    const handleSubjectChange = (nextSubjectId: string) => {
        setSelectedSubjectId(nextSubjectId);
        setSelectedClassGroupId('');
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
            // Error handled by mutation toast/api provider
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
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create Classroom</DialogTitle>
                    <DialogDescription>
                        Choose an approved offered subject and one section, then give the classroom
                        a clear instructor-facing name.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="classroom-subject">Approved Offering</Label>
                        <Select
                            value={activeSubjectId || undefined}
                            onValueChange={handleSubjectChange}
                            disabled={noAvailableSections}
                        >
                            <SelectTrigger id="classroom-subject">
                                <SelectValue placeholder="Select an approved offering" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjectOptions.map((subject) => (
                                    <SelectItem
                                        key={subject.id}
                                        value={subject.id}
                                        title={subject.label}
                                    >
                                        <span className="block max-w-full truncate">
                                            {subject.compactLabel}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedSubject ? (
                            <p
                                className="text-muted-foreground truncate text-xs"
                                title={selectedSubject.termLabel}
                            >
                                {selectedSubject.termLabel}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="classroom-section">Section</Label>
                        <Select
                            value={activeClassGroupId || undefined}
                            onValueChange={setSelectedClassGroupId}
                            disabled={!selectedSubject || noAvailableSections}
                        >
                            <SelectTrigger id="classroom-section">
                                <SelectValue placeholder="Select a section" />
                            </SelectTrigger>
                            <SelectContent>
                                {(selectedSubject?.sections ?? []).map((section) => (
                                    <SelectItem
                                        key={section.classGroupId}
                                        value={section.classGroupId}
                                        title={section.compactLabel}
                                    >
                                        <span className="block max-w-full truncate">
                                            {section.compactLabel}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedSubject ? (
                        <div className="bg-muted/30 space-y-1 rounded-lg border p-3 text-sm">
                            <p className="truncate font-medium" title={selectedSubject.label}>
                                {selectedSubject.label}
                            </p>
                            {selectedSection ? (
                                <p
                                    className="text-muted-foreground truncate"
                                    title={selectedSection.compactLabel}
                                >
                                    {selectedSection.compactLabel}
                                </p>
                            ) : null}
                        </div>
                    ) : null}

                    <div className="space-y-2">
                        <Label htmlFor="classroom-name">Classroom Name</Label>
                        <Input
                            id="classroom-name"
                            placeholder={suggestedClassName || 'e.g. CS Fundamentals - 3A'}
                            value={className}
                            onChange={(event) => setClassName(event.target.value)}
                            disabled={noAvailableSections}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="classroom-instructor">Assign Instructor (Optional)</Label>
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

                    {noAvailableSections ? (
                        <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
                            All of your current approved sections already have classrooms, or you do
                            not have any approved sections yet.
                        </div>
                    ) : null}

                    <div className="flex justify-end gap-3 pt-2">
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
            </DialogContent>
        </Dialog>
    );
}


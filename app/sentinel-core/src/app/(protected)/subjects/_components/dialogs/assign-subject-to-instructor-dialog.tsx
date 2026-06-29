'use client';

import * as React from 'react';
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@sentinel/ui';
import { useAssignSubjectToInstructor } from '../../_hooks/use-assign-subject-to-instructor';
import { UserPlus } from 'lucide-react';
import { SelectedInstructorCard } from './_components/selected-instructor-card';
import { InstructorSearchCombobox } from './_components/instructor-search-combobox';

interface AssignSubjectToInstructorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subjectOfferingId: string | string[];
    subjectCode?: string;
    subjectTitle?: string;
}

/**
 * Component to display copy depending on whether a single subject or multiple subjects are selected.
 */
function DialogDescriptionText({
    subjectOfferingId,
    subjectCode,
    subjectTitle,
}: Omit<AssignSubjectToInstructorDialogProps, 'open' | 'onOpenChange'>) {
    if (Array.isArray(subjectOfferingId)) {
        return (
            <>
                Directly assign the{' '}
                <strong className="text-foreground">
                    {subjectOfferingId.length} selected offered subjects
                </strong>{' '}
                to an instructor. They will be automatically enrolled and granted teaching access to the associated classrooms.
            </>
        );
    }

    return (
        <>
            Directly assign the offered subject{' '}
            <strong className="text-foreground">
                {subjectCode} - {subjectTitle}
            </strong>{' '}
            to an instructor. They will be automatically enrolled and granted teaching access to the associated classrooms.
        </>
    );
}

export function AssignSubjectToInstructorDialog({
    open,
    onOpenChange,
    subjectOfferingId,
    subjectCode,
    subjectTitle,
}: AssignSubjectToInstructorDialogProps) {
    const handleClose = React.useCallback(() => {
        onOpenChange(false);
    }, [onOpenChange]);

    const {
        searchTerm,
        openCombobox,
        setOpenCombobox,
        selectedInstructorId,
        setSelectedInstructorId,
        selectedInstructor,
        setSelectedInstructor,
        searchedInstructors,
        isSearchLoading,
        isPending,
        selectedName,
        displayValue,
        setDisplayValue,
        handleReset,
        handleInputChange,
        handleFocus,
        handleAssign,
    } = useAssignSubjectToInstructor(subjectOfferingId, handleClose);

    const handleOpenChange = React.useCallback(
        (nextOpen: boolean) => {
            onOpenChange(nextOpen);
            if (!nextOpen) {
                handleReset();
            }
        },
        [onOpenChange, handleReset],
    );

    const handleSelectInstructor = React.useCallback(
        (val: string | null) => {
            setSelectedInstructorId(val);
            if (!val) {
                setSelectedInstructor(null);
                setDisplayValue('');
                setOpenCombobox(false);
                return;
            }
            const found = searchedInstructors.find((u) => u.id === val);
            if (found) {
                setSelectedInstructor(found);
                const name = [found.firstName, found.lastName].filter(Boolean).join(' ') || found.email;
                setDisplayValue(name);
            } else {
                setSelectedInstructor(null);
                setDisplayValue('');
            }
            setOpenCombobox(false);
        },
        [searchedInstructors, setSelectedInstructorId, setSelectedInstructor, setDisplayValue, setOpenCombobox],
    );

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="border-border/70 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden p-0 bg-white dark:bg-zinc-950">
                <DialogHeader className="border-border/70 bg-muted/15 border-b px-5 py-4">
                    <div className="flex items-center gap-2">
                        <UserPlus className="text-primary h-5 w-5" />
                        <DialogTitle className="text-lg font-bold">
                            Assign to Instructor
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-muted-foreground mt-1.5 text-sm leading-5">
                        <DialogDescriptionText
                            subjectOfferingId={subjectOfferingId}
                            subjectCode={subjectCode}
                            subjectTitle={subjectTitle}
                        />
                    </DialogDescription>
                </DialogHeader>

                <div className="px-5 py-4 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            Search Instructor
                        </label>
                        <InstructorSearchCombobox
                            value={selectedInstructorId}
                            displayValue={displayValue}
                            searchTerm={searchTerm}
                            open={openCombobox}
                            onOpenChange={setOpenCombobox}
                            searchedInstructors={searchedInstructors}
                            isSearchLoading={isSearchLoading}
                            onInputChange={handleInputChange}
                            onFocus={handleFocus}
                            onSelect={handleSelectInstructor}
                        />
                    </div>

                    {selectedInstructor && (
                        <SelectedInstructorCard
                            instructor={selectedInstructor}
                            name={selectedName}
                        />
                    )}
                </div>

                <DialogFooter className="border-border/70 bg-muted/10 border-t px-5 py-3 sm:justify-end">
                    <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => handleOpenChange(false)}
                            className="rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={isPending || !selectedInstructorId}
                            onClick={handleAssign}
                            className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white font-medium rounded-lg px-4"
                        >
                            {isPending ? 'Assigning...' : 'Assign'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

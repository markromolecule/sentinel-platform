'use client';

import {
    Button,
    Checkbox,
    Label,
    Separator,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    cn,
} from '@sentinel/ui';
import { type Subject } from '@sentinel/shared/types';
import { SectionOption } from '../_hooks/use-unenrollment';

interface UnenrollSubjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subject: Subject;
    allSections: SectionOption[];
    selectedSectionIds: string[];
    onToggleSection: (id: string) => void;
    onToggleAll: () => void;
    onUnenroll: () => void;
    isPending: boolean;
}

export function UnenrollSubjectDialog({
    open,
    onOpenChange,
    subject,
    allSections,
    selectedSectionIds,
    onToggleSection,
    onToggleAll,
    onUnenroll,
    isPending,
}: UnenrollSubjectDialogProps) {
    const isPendingStatus = subject.status === 'PENDING';
    const isSelectionEmpty = selectedSectionIds.length === 0;
    const isAllSelected = selectedSectionIds.length === allSections.length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {isPendingStatus ? 'Cancel Enrollment Request?' : 'Unenroll from Subject?'}
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2 font-normal text-muted-foreground/90">
                        This action cannot be undone. This will{' '}
                        {isPendingStatus ? 'remove your enrollment request for' : 'unenroll you from'}{' '}
                        <strong>
                            {subject.code}: {subject.title}
                        </strong>{' '}
                        for the selected sections.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="text-sm font-semibold text-foreground/80">
                            Select sections to unenroll:
                        </h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/5"
                            onClick={onToggleAll}
                        >
                            {isAllSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="grid gap-3 max-h-[200px] overflow-y-auto px-1 py-1 custom-scrollbar">
                        {allSections.map((s) => (
                            <div key={s.id} className="flex items-center space-x-3 transition-colors hover:bg-muted/30 p-1.5 rounded-md group">
                                <Checkbox
                                    id={`section-${s.id}`}
                                    checked={selectedSectionIds.includes(s.id)}
                                    onCheckedChange={() => onToggleSection(s.id)}
                                />
                                <Label
                                    htmlFor={`section-${s.id}`}
                                    className={cn(
                                        'text-sm font-medium leading-none cursor-pointer transition-colors',
                                        selectedSectionIds.includes(s.id) ? 'text-destructive font-bold' : 'text-foreground'
                                    )}
                                >
                                    {s.name}
                                </Label>
                            </div>
                        ))}
                    </div>

                    {isSelectionEmpty && (
                        <p className="text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1 pl-1">
                            * Select at least one section to continue
                        </p>
                    )}
                </div>

                <DialogFooter className="gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        className="flex-1 sm:flex-none font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onUnenroll}
                        disabled={isPending || isSelectionEmpty}
                        className="bg-red-600 hover:bg-red-700 font-semibold flex-1 sm:flex-none"
                    >
                        {isPending ? 'Unenrolling...' : 'Unenroll'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

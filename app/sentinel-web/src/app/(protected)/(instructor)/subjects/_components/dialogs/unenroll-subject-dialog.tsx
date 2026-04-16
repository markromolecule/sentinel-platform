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
import { type UnenrollSubjectDialogProps } from '@/app/(protected)/(instructor)/subjects/_components/dialogs/_types';

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
                    <DialogDescription className="text-muted-foreground/90 pt-2 text-base font-normal">
                        This action cannot be undone. This will{' '}
                        {isPendingStatus
                            ? 'remove your enrollment request for'
                            : 'unenroll you from'}{' '}
                        <strong>
                            {subject.code}: {subject.title}
                        </strong>{' '}
                        for the selected sections.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="text-foreground/80 text-sm font-semibold">
                            Select sections to unenroll:
                        </h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/5 h-7 text-xs"
                            onClick={onToggleAll}
                        >
                            {isAllSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                    </div>

                    <Separator className="bg-border/50" />

                    <div className="custom-scrollbar grid max-h-[200px] gap-3 overflow-y-auto px-1 py-1">
                        {allSections.map((s) => (
                            <div
                                key={s.id}
                                className="hover:bg-muted/30 group flex items-center space-x-3 rounded-md p-1.5 transition-colors"
                            >
                                <Checkbox
                                    id={`section-${s.id}`}
                                    checked={selectedSectionIds.includes(s.id)}
                                    onCheckedChange={() => onToggleSection(s.id)}
                                />
                                <Label
                                    htmlFor={`section-${s.id}`}
                                    className={cn(
                                        'cursor-pointer text-sm leading-none font-medium transition-colors',
                                        selectedSectionIds.includes(s.id)
                                            ? 'text-destructive font-bold'
                                            : 'text-foreground',
                                    )}
                                >
                                    {s.name}
                                </Label>
                            </div>
                        ))}
                    </div>

                    {isSelectionEmpty && (
                        <p className="text-destructive animate-in fade-in slide-in-from-top-1 pl-1 text-xs font-medium">
                            * Select at least one section to continue
                        </p>
                    )}
                </div>

                <DialogFooter className="gap-3">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        className="flex-1 font-semibold sm:flex-none"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onUnenroll}
                        disabled={isPending || isSelectionEmpty}
                        className="flex-1 bg-red-600 font-semibold hover:bg-red-700 sm:flex-none"
                    >
                        {isPending ? 'Unenrolling...' : 'Unenroll'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

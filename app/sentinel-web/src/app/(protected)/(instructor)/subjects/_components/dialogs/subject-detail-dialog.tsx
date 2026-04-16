'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Badge,
    ScrollArea,
} from '@sentinel/ui';
import { type Subject } from '@sentinel/shared/types';
import { format } from 'date-fns';

interface SubjectDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subject: Subject;
}

export function SubjectDetailDialog({ open, onOpenChange, subject }: SubjectDetailDialogProps) {
    const sections = (subject.sections || []) as Array<string | { id: string; name: string }>;
    const sectionLabels = sections.map((section) =>
        typeof section === 'string' ? section : section.name,
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span>{subject.code}</span>
                        <Badge
                            variant={
                                subject.status === 'PENDING'
                                    ? 'secondary'
                                    : subject.status === 'APPROVED'
                                      ? 'default'
                                      : subject.status === 'REJECTED'
                                        ? 'destructive'
                                        : 'default'
                            }
                            className="h-5 text-[10px] font-bold tracking-wider uppercase"
                        >
                            {subject.status || 'APPROVED'}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-foreground text-base font-medium">
                        {subject.title}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                    Term
                                </h4>
                                <p className="mt-1 text-sm font-medium">
                                    {subject.termAcademicYear} • {subject.termSemester}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                    Department & Course
                                </h4>
                                <p className="mt-1 text-sm font-medium">
                                    {subject.department_code || 'N/A'} /{' '}
                                    {subject.course_code || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                                Year Levels
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {(subject.yearLevels || []).length > 0 ? (
                                    subject.yearLevels?.map((year) => (
                                        <Badge key={year} variant="secondary">
                                            Year {year}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground text-sm italic">
                                        None
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                                Assigned Sections
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {sectionLabels.length > 0 ? (
                                    sectionLabels.map((section) => (
                                        <Badge
                                            key={section}
                                            variant="outline"
                                            className="border-primary/20 bg-primary/5 text-primary"
                                        >
                                            {section}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground text-sm italic">
                                        None
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <div>
                                <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                    Requested At
                                </h4>
                                <p className="mt-1 text-sm">
                                    {subject.requested_at
                                        ? format(new Date(subject.requested_at), 'PPP')
                                        : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                    Approved At
                                </h4>
                                <p className="mt-1 text-sm">
                                    {subject.approved_at
                                        ? format(new Date(subject.approved_at), 'PPP')
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {subject.approved_by && (
                            <div className="border-t pt-4">
                                <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                                    Approved By
                                </h4>
                                <p className="mt-1 text-sm font-medium">{subject.approved_by}</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

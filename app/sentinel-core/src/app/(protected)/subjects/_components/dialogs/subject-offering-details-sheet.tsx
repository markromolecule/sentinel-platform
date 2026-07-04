'use client';

import * as React from 'react';
import { format } from 'date-fns';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    Badge,
    Separator,
} from '@sentinel/ui';
import { useSubjectOfferingQuery } from '@sentinel/hooks';
import { StatusBadge } from '@/components/common/status-badge';
import { InheritanceStatusBadge } from '@/components/common/inheritance-status-badge';
import { BookOpen, Calendar, Layers, Users, ShieldAlert, Loader2, Mail } from 'lucide-react';

interface SubjectOfferingDetailsSheetProps {
    offeringId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SubjectOfferingDetailsSheet({
    offeringId,
    open,
    onOpenChange,
}: SubjectOfferingDetailsSheetProps) {
    const {
        data: offering,
        isLoading,
        isError,
    } = useSubjectOfferingQuery(offeringId ?? '', open && Boolean(offeringId));

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto bg-white px-0 sm:max-w-md md:max-w-lg lg:max-w-xl dark:bg-zinc-950">
                <SheetHeader className="px-6 pb-6 text-left">
                    {isLoading ? (
                        <div className="flex items-center gap-2 py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                            <SheetTitle className="font-medium text-zinc-500">
                                Loading details...
                            </SheetTitle>
                        </div>
                    ) : isError || !offering ? (
                        <div className="text-destructive flex items-center gap-2 py-4">
                            <ShieldAlert className="h-5 w-5" />
                            <SheetTitle className="text-destructive font-semibold">
                                Error loading offering details
                            </SheetTitle>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2 pt-2">
                                <Badge className="bg-[#323d8f] text-white hover:bg-[#323d8f]">
                                    {offering.subjectCode}
                                </Badge>
                                <StatusBadge status={offering.status} />
                                <InheritanceStatusBadge record={offering} />
                            </div>
                            <SheetTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                {offering.subjectTitle}
                            </SheetTitle>
                            <SheetDescription className="text-muted-foreground flex items-center gap-1.5 text-sm">
                                <Calendar className="h-4 w-4 shrink-0" />
                                {offering.termAcademicYear} • {offering.termSemester}
                            </SheetDescription>
                        </div>
                    )}
                </SheetHeader>

                <Separator className="bg-zinc-100 dark:bg-zinc-800" />

                {isLoading && (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-[#323d8f]" />
                    </div>
                )}

                {isError && (
                    <div className="flex h-64 flex-col items-center justify-center space-y-2 p-6 text-center">
                        <ShieldAlert className="h-10 w-10 text-red-500" />
                        <h4 className="font-semibold text-zinc-800 dark:text-zinc-200">
                            Failed to load subject offering
                        </h4>
                        <p className="text-sm text-zinc-500">
                            Please close this panel and try again later.
                        </p>
                    </div>
                )}

                {!isLoading && !isError && offering && (
                    <div className="space-y-8 px-6 py-6 pb-24 text-left">
                        {/* Term Dates Section */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                                Term Information
                            </h4>
                            <div className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/30">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Academic Year:</span>
                                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                        {offering.termAcademicYear}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Semester:</span>
                                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                        {offering.termSemester}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Duration:</span>
                                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                        {offering.termStartDate
                                            ? format(
                                                  new Date(offering.termStartDate),
                                                  'MMM d, yyyy',
                                              )
                                            : 'TBD'}{' '}
                                        -{' '}
                                        {offering.termEndDate
                                            ? format(new Date(offering.termEndDate), 'MMM d, yyyy')
                                            : 'TBD'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Audience Assignments Section */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                                Audience Scope
                            </h4>
                            <div className="space-y-3">
                                {/* Departments */}
                                <div>
                                    <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                                        <BookOpen className="h-3.5 w-3.5" /> Departments
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {offering.departments && offering.departments.length > 0 ? (
                                            offering.departments.map((dept) => (
                                                <Badge
                                                    key={dept.id}
                                                    variant="secondary"
                                                    className="py-0.5 text-xs"
                                                >
                                                    {dept.code?.trim() || dept.name}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-zinc-400 italic">
                                                No departments specified
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Courses */}
                                <div>
                                    <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                                        <Layers className="h-3.5 w-3.5" /> Courses
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {offering.courses && offering.courses.length > 0 ? (
                                            offering.courses.map((course) => (
                                                <Badge
                                                    key={course.id}
                                                    variant="secondary"
                                                    className="py-0.5 text-xs"
                                                >
                                                    {course.code?.trim() || course.title}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-zinc-400 italic">
                                                No courses specified
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Year Levels */}
                                <div>
                                    <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                                        <Layers className="h-3.5 w-3.5" /> Year Levels
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {offering.yearLevels && offering.yearLevels.length > 0 ? (
                                            offering.yearLevels.map((level) => (
                                                <Badge
                                                    key={level}
                                                    variant="secondary"
                                                    className="py-0.5 text-xs"
                                                >
                                                    Year {level}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-zinc-400 italic">
                                                No year levels specified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sections & Classrooms */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                                Configured Sections
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                                {offering.sections && offering.sections.length > 0 ? (
                                    offering.sections.map((section) => (
                                        <div
                                            key={section.id}
                                            className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 text-sm dark:border-zinc-800"
                                        >
                                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                                                {section.name}
                                            </span>
                                            {section.yearLevel && (
                                                <Badge variant="outline" className="text-[10px]">
                                                    Year {section.yearLevel}
                                                </Badge>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-lg border border-dashed p-4 text-center text-xs text-zinc-400">
                                        No sections configured for this offering.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Assigned Instructors Section */}
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-zinc-500 uppercase">
                                <Users className="h-4 w-4" /> Assigned Instructors
                            </h4>
                            <div className="space-y-2">
                                {offering.instructors && offering.instructors.length > 0 ? (
                                    offering.instructors.map((instructor) => (
                                        <div
                                            key={instructor.id}
                                            className="flex flex-col space-y-1 rounded-xl border border-zinc-100 bg-zinc-50/20 p-3.5 dark:border-zinc-800 dark:bg-zinc-900/10"
                                        >
                                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                {[instructor.firstName, instructor.lastName]
                                                    .filter(Boolean)
                                                    .join(' ') || 'Unnamed Instructor'}
                                            </span>
                                            {instructor.email && (
                                                <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                                                    <Mail className="h-3 w-3 shrink-0" />
                                                    {instructor.email}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/5 p-6 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/5">
                                        No instructors are currently assigned to this subject
                                        offering.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

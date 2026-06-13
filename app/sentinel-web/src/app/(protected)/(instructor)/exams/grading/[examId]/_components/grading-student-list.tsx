'use client';

import Link from 'next/link';
import {
    Badge,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    SearchBar,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@sentinel/ui';
import type { GradingStudentSection } from '@sentinel/shared/types';

interface GradingStudentListProps {
    examId: string;
    sections: GradingStudentSection[];
    isLoading?: boolean;
    searchValue: string;
    onSearchChange: (value: string) => void;
    sectionId?: string;
    onSectionChange: (sectionId?: string) => void;
    availableSections: {
        id: string;
        name: string;
    }[];
    isSectionsLoading?: boolean;
}

function renderStatusBadge(status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'GRADED') {
    return (
        <Badge
            variant={
                status === 'GRADED'
                    ? 'default'
                    : status === 'SUBMITTED'
                      ? 'secondary'
                      : 'destructive'
            }
        >
            {status.replace('_', ' ')}
        </Badge>
    );
}

function getSectionLabel(section: GradingStudentSection) {
    return section.sectionName ?? 'Unassigned Section';
}

export function GradingStudentList({
    examId,
    sections,
    isLoading,
    searchValue,
    onSearchChange,
    sectionId,
    onSectionChange,
    availableSections,
    isSectionsLoading,
}: GradingStudentListProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <SearchBar
                    placeholder="Filter students..."
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    containerClassName="w-full md:max-w-sm"
                />
                <Select
                    value={sectionId || 'all'}
                    onValueChange={(value) => onSectionChange(value === 'all' ? undefined : value)}
                >
                    <SelectTrigger className="w-full md:w-[220px]">
                        <SelectValue
                            placeholder={isSectionsLoading ? 'Loading sections...' : 'All Sections'}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        {availableSections.map((section) => (
                            <SelectItem key={section.id} value={section.id}>
                                {section.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                Array.from({ length: 2 }).map((_, index) => (
                    <Card key={`grading-section-skeleton-${index}`}>
                        <CardHeader className="space-y-3">
                            <Skeleton className="h-6 w-48" />
                            <div className="grid gap-3 md:grid-cols-3">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Array.from({ length: 3 }).map((__, rowIndex) => (
                                    <Skeleton
                                        key={`grading-section-skeleton-row-${index}-${rowIndex}`}
                                        className="h-12 w-full"
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : sections.length === 0 ? (
                <Card>
                    <CardContent className="text-muted-foreground py-12 text-center">
                        No students matched the current filters.
                    </CardContent>
                </Card>
            ) : (
                sections.map((section) => (
                    <Card key={section.sectionId ?? section.sectionName ?? 'unassigned'}>
                        <CardHeader className="gap-4">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <CardTitle>{getSectionLabel(section)}</CardTitle>
                                <Badge variant="outline">
                                    {section.totalStudents} student
                                    {section.totalStudents === 1 ? '' : 's'}
                                </Badge>
                            </div>
                            <div className="grid gap-3 md:grid-cols-3">
                                <div className="rounded-lg border p-3">
                                    <div className="text-muted-foreground text-xs uppercase">
                                        Students
                                    </div>
                                    <div className="text-2xl font-semibold">
                                        {section.totalStudents}
                                    </div>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <div className="text-muted-foreground text-xs uppercase">
                                        Submitted
                                    </div>
                                    <div className="text-2xl font-semibold">
                                        {section.submittedCount}
                                    </div>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <div className="text-muted-foreground text-xs uppercase">
                                        Graded
                                    </div>
                                    <div className="text-2xl font-semibold">
                                        {section.gradedCount}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Submission Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {section.students.map((student) => {
                                        const showLink =
                                            student.attemptId && student.status !== 'NOT_SUBMITTED';

                                        return (
                                            <TableRow key={student.id}>
                                                <TableCell>
                                                    {showLink ? (
                                                        <Link
                                                            href={`/exams/grading/${examId}/${student.attemptId}`}
                                                            className="text-primary font-medium hover:underline"
                                                        >
                                                            {student.name}
                                                        </Link>
                                                    ) : (
                                                        <div className="font-medium">
                                                            {student.name}
                                                        </div>
                                                    )}
                                                    <div className="text-muted-foreground text-xs">
                                                        {student.studentId}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {student.submissionDate ? (
                                                        new Date(
                                                            student.submissionDate,
                                                        ).toLocaleString()
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {renderStatusBadge(student.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {student.score === null ||
                                                    student.score === undefined ? (
                                                        <span className="text-muted-foreground">
                                                            -/{student.maxScore}
                                                        </span>
                                                    ) : (
                                                        <span className="font-medium">
                                                            {student.score}/{student.maxScore}
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    );
}

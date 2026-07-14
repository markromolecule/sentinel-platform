'use client';

import { use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GradingStudentList } from '@/app/(protected)/(instructor)/exams/grading/[examId]/_components/grading-student-list';
import {
    useExportGrades,
    useGradingDetail,
} from '@/app/(protected)/(instructor)/exams/grading/_hooks';
import { Button, Separator } from '@sentinel/ui';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

interface ExamGradingPageProps {
    params: Promise<{
        examId: string;
    }>;
}

export default function ExamGradingPage({ params }: ExamGradingPageProps) {
    const { examId } = use(params);

    /** Raw search input (immediate, for the controlled input) */
    const [searchInput, setSearchInput] = useState('');
    /** Debounced search value sent to the API */
    const [debouncedSearch, setDebouncedSearch] = useState('');
    /** Section ID selected via the facet filter (server-side) */
    const [sectionId, setSectionId] = useState<string | undefined>();

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { exam, students, isLoading } = useGradingDetail(examId, sectionId, debouncedSearch);
    const { exportToExcel } = useExportGrades();

    /**
     * 300 ms debounce: update the raw input immediately for the controlled
     * SearchBar, but only fire the API query after the user stops typing.
     */
    const handleSearchChange = useCallback((value: string) => {
        setSearchInput(value);
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            setDebouncedSearch(value);
        }, 300);
    }, []);

    useEffect(
        () => () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        },
        [],
    );

    const gradingSections = useMemo(
        () =>
            (exam?.sectionIds ?? [])
                .map((id, index) => ({
                    id,
                    name: exam?.sectionNames?.[index] ?? `Section ${index + 1}`,
                }))
                .sort((left, right) => left.name.localeCompare(right.name)),
        [exam?.sectionIds, exam?.sectionNames],
    );

    if (!exam) {
        return (
            <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
                <div className="flex animate-pulse items-center justify-between space-y-2">
                    <div className="bg-muted h-8 w-1/4 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex-1 flex-col gap-6 p-8 md:flex">
            <div className="space-y-4">
                <div className="flex items-center justify-between space-y-2">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">{exam.title}</h2>
                        <p className="text-muted-foreground">
                            {exam.classroomName || exam.subject} •{' '}
                            {exam.scheduledDate || exam.createdAt
                                ? new Date(exam.scheduledDate || exam.createdAt).toLocaleDateString()
                                : 'No schedule'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Export button styled with a soft Excel green */}
                        <Button
                            className="border-[#217346] bg-[#217346]/10 text-[#217346] hover:bg-[#217346]/20"
                            variant="outline"
                            onClick={() => exportToExcel(students, exam.title)}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export to Excel
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/exams/grading">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Link>
                        </Button>
                    </div>
                </div>
                <Separator />
            </div>
            <GradingStudentList
                students={students}
                isLoading={isLoading}
                searchValue={searchInput}
                onSearchChange={handleSearchChange}
                availableSections={gradingSections}
                onSectionChange={setSectionId}
            />
        </div>
    );
}

'use client';

import { use, useMemo, useState } from 'react';
import { GradingStudentList } from '@/app/(protected)/(instructor)/exams/grading/[examId]/_components/grading-student-list';
import {
    useExportGrades,
    useGradingDetail,
} from '@/app/(protected)/(instructor)/exams/grading/_hooks';
import { Button } from '@sentinel/ui';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

interface ExamGradingPageProps {
    params: Promise<{
        examId: string;
    }>;
}

export default function ExamGradingPage({ params }: ExamGradingPageProps) {
    const { examId } = use(params);
    const [sectionId, setSectionId] = useState<string | undefined>();
    const [studentSearch, setStudentSearch] = useState('');
    const { exam, students, studentSections, isLoading } = useGradingDetail(examId, sectionId);
    const { exportToExcel } = useExportGrades();
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

    const visibleStudents = useMemo(() => {
        const normalizedSearch = studentSearch.trim().toLowerCase();

        if (!normalizedSearch) {
            return students;
        }

        return students.filter((student: (typeof students)[number]) => {
            const haystack = [student.name, student.studentId, student.sectionName ?? '']
                .join(' ')
                .toLowerCase();

            return haystack.includes(normalizedSearch);
        });
    }, [studentSearch, students]);

    const visibleSections = useMemo(() => {
        const visibleStudentIds = new Set(visibleStudents.map((student) => student.id));

        return studentSections
            .map((section) => {
                const sectionStudents = section.students.filter((student) =>
                    visibleStudentIds.has(student.id),
                );

                return {
                    ...section,
                    totalStudents: sectionStudents.length,
                    submittedCount: sectionStudents.filter(
                        (student) => student.status !== 'NOT_SUBMITTED',
                    ).length,
                    gradedCount: sectionStudents.filter((student) => student.status === 'GRADED')
                        .length,
                    students: sectionStudents,
                };
            })
            .filter((section) => section.students.length > 0);
    }, [studentSections, visibleStudents]);

    const selectedSectionName = useMemo(
        () => gradingSections.find((section) => section.id === sectionId)?.name,
        [gradingSections, sectionId],
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
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div className="space-y-1">
                    <div className="text-muted-foreground flex items-center gap-2">
                        <Link
                            href="/exams/grading"
                            className="hover:text-foreground transition-colors"
                        >
                            Grading
                        </Link>
                        <span>/</span>
                        <span>{exam.title}</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">{exam.title}</h2>
                    <p className="text-muted-foreground">
                        {exam.classroomName || exam.subject} •{' '}
                        {exam.scheduledDate || exam.createdAt
                            ? new Date(exam.scheduledDate || exam.createdAt).toLocaleDateString()
                            : 'No schedule'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() =>
                            exportToExcel(visibleStudents, exam.title, selectedSectionName)
                        }
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
            <GradingStudentList
                examId={examId}
                sections={visibleSections}
                isLoading={isLoading}
                searchValue={studentSearch}
                onSearchChange={setStudentSearch}
                sectionId={sectionId}
                onSectionChange={setSectionId}
                availableSections={gradingSections}
                isSectionsLoading={!exam}
            />
        </div>
    );
}

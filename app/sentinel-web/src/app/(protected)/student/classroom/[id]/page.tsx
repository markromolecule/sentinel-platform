'use client';

import { useParams, useRouter } from 'next/navigation';
import { useStudentClassroomsQuery, useExamsQuery } from '@sentinel/hooks';
import { ArrowLeft, BookOpen, GraduationCap, Calendar, Search } from 'lucide-react';
import { Button, Input, Card, CardContent } from '@sentinel/ui';
import { ExamCard } from '../../exam/_components/exam-card';
import { Skeleton } from '@sentinel/ui';
import { useState } from 'react';
import { normalizeStudentExam } from '../../_lib/normalize-student-exam';
import type { StudentClassroom } from '@sentinel/shared';
import type { ProctorExam } from '@sentinel/shared/types';

function isActiveClassroomAssessmentStatus(status: string) {
    return status === 'available' || status === 'upcoming' || status === 'in-progress';
}

function matchesStudentClassroomExam(classroom: StudentClassroom, exam: ProctorExam) {
    const classroomIds = exam.classroomIds ?? [];
    const sectionIds = exam.sectionIds ?? [];

    if (classroomIds.length > 0) {
        return classroomIds.includes(classroom.id);
    }

    if (exam.classroomId) {
        return exam.classroomId === classroom.id;
    }

    if (sectionIds.includes(classroom.sectionId)) {
        return true;
    }

    // Keep older published exams visible when they were linked only by subject
    // and do not yet carry an explicit classroom/section association.
    return (
        exam.subjectId === classroom.subjectId &&
        !exam.classroomId &&
        sectionIds.length === 0 &&
        !exam.section
    );
}

export default function StudentClassroomDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [search, setSearch] = useState('');

    const { data: classrooms, isLoading: isClassroomsLoading } = useStudentClassroomsQuery();
    const classroom = classrooms?.find((c) => c.id === id);

    const { data: exams, isLoading: isExamsLoading } = useExamsQuery({ classroomId: id }, {
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
    });

    const filteredExams = classroom
        ? (exams
              ?.map(normalizeStudentExam)
              .filter(
                  (exam) =>
                      matchesStudentClassroomExam(classroom, exam) &&
                      isActiveClassroomAssessmentStatus(exam.status) &&
                      exam.title.toLowerCase().includes(search.toLowerCase()),
              ) ?? [])
        : [];

    if (isClassroomsLoading || !classroom) {
        if (!isClassroomsLoading && !classroom) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="font-medium text-red-500">Classroom not found</p>
                    <Button variant="ghost" onClick={() => router.back()} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </div>
            );
        }
        return (
            <div className="animate-in fade-in space-y-8 py-8 duration-500">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-8 py-8 duration-500">
            {/* Header / Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#323d8f] to-[#4a5bb8] p-8 text-white shadow-xl md:p-12">
                <div className="relative z-10 space-y-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/80 hover:bg-white/10 hover:text-white"
                        onClick={() => router.push('/student/classroom')}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Classrooms
                    </Button>

                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-lg bg-white/20 px-3 py-1 text-sm font-bold backdrop-blur-md">
                                {classroom.subjectCode}
                            </span>
                            <span className="rounded-lg bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-md">
                                Section {classroom.sectionName}
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold md:text-5xl">
                            {classroom.subjectTitle}
                        </h1>
                        <div className="flex flex-wrap gap-6 text-white/90">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" />
                                <span className="text-sm font-medium">
                                    {classroom.instructors?.length > 0
                                        ? classroom.instructors.join(', ')
                                        : 'TBA'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                <span className="text-sm font-medium">{classroom.term}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decorative Icon */}
                <BookOpen className="absolute -right-8 -bottom-8 h-64 w-64 rotate-12 text-white/10" />
            </div>

            {/* Exams Section */}
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-2xl font-bold">Class Assessments</h2>
                    <div className="relative w-full max-w-sm">
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Filter exams..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-muted/50 h-10 rounded-xl border-none pl-10"
                        />
                    </div>
                </div>

                {isExamsLoading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                        ))}
                    </div>
                ) : filteredExams.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                                <span className="text-xl">📝</span>
                            </div>
                            <p className="text-muted-foreground font-medium">
                                No assessments found
                            </p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {search
                                    ? 'Try a different search term.'
                                    : 'There are no active assessments assigned to this classroom right now.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredExams.map((exam) => (
                            <ExamCard key={exam.id} exam={exam} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

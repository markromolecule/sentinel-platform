'use client';

import { useState } from 'react';
import { useStableValue } from '@sentinel/hooks';
import { ExamCard, ExamCreateDialog, ExamEmptyState, useProctorExams } from '@/features/exams';
import { type Exam } from '@sentinel/shared/types';
import {
    PageHeader,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    SearchBar,
    Button,
    Separator,
} from '@sentinel/ui';
import { Plus, UserCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ProctorAssignmentTable } from '@/app/(protected)/(instructor)/exams/assignment/_components/assignment-table';
import { MOCK_PROCTOR, MOCK_PROCTOR_EXAMS } from '@sentinel/shared/constants';
import { GradingList } from '@/app/(protected)/(instructor)/exams/grading/_components/grading-list';

export default function ExamsDashboardClient() {
    const { exams, isLoading } = useProctorExams();
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const searchParams = useSearchParams();
    const view = searchParams.get('view');

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center">Loading exams...</div>;
    }

    if (view === 'assign') {
        return <AssignmentView />;
    }

    if (view === 'grade') {
        return <GradingView />;
    }

    const filteredExams = useStableValue(
        () =>
            (exams || []).filter((exam: Exam) =>
                exam.title.toLowerCase().includes(search.toLowerCase()),
            ),
        [exams, search],
    );

    const published = useStableValue(
        () =>
            filteredExams.filter(
                (exam: Exam) => exam.status === 'published' || exam.status === 'active',
            ),
        [filteredExams],
    );
    const drafts = useStableValue(
        () => filteredExams.filter((exam: Exam) => exam.status === 'draft'),
        [filteredExams],
    );
    const archived = useStableValue(
        () => filteredExams.filter((exam: Exam) => exam.status === 'archived'),
        [filteredExams],
    );

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Exams"
                description="Create, organize, and monitor your examinations in one place."
            >
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4" /> Create Exam
                </Button>
                <ExamCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
            </PageHeader>

            <Separator />

            <div className="flex flex-col gap-4">
                <SearchBar
                    placeholder="Search exams..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="md:max-w-sm"
                />

                <Tabs defaultValue="all" className="space-y-4">
                    <TabsList className="border-border/60 h-auto w-full justify-start gap-4 rounded-none border-b bg-transparent p-0">
                        <TabsTrigger
                            value="all"
                            className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-0 border-b-2 border-transparent px-1 pb-2 text-sm font-medium shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            All{' '}
                            <span className="text-muted-foreground ml-2 text-xs">
                                ({filteredExams.length})
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="published"
                            className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-0 border-b-2 border-transparent px-1 pb-2 text-sm font-medium shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Published{' '}
                            <span className="text-muted-foreground ml-2 text-xs">
                                ({published.length})
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="drafts"
                            className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-0 border-b-2 border-transparent px-1 pb-2 text-sm font-medium shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Drafts{' '}
                            <span className="text-muted-foreground ml-2 text-xs">
                                ({drafts.length})
                            </span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="archived"
                            className="data-[state=active]:border-primary data-[state=active]:text-primary rounded-none border-0 border-b-2 border-transparent px-1 pb-2 text-sm font-medium shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Archived{' '}
                            <span className="text-muted-foreground ml-2 text-xs">
                                ({archived.length})
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="m-0">
                        {filteredExams.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredExams.map((exam: Exam) => (
                                    <ExamCard key={exam.id} exam={exam} />
                                ))}
                            </div>
                        ) : (
                            <ExamEmptyState
                                isSearching={Boolean(search.trim())}
                                onCreateClick={() => setIsCreateOpen(true)}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="published" className="m-0">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {published.map((exam: Exam) => (
                                <ExamCard key={exam.id} exam={exam} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="drafts" className="m-0">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {drafts.map((exam: Exam) => (
                                <ExamCard key={exam.id} exam={exam} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="archived" className="m-0">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {archived.map((exam: Exam) => (
                                <ExamCard key={exam.id} exam={exam} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function AssignmentView() {
    const assignedExams = useStableValue(
        () =>
            MOCK_PROCTOR_EXAMS.map((exam) => ({
                ...exam,
                assignedInstructor: exam.id === '2' ? 'John Doe' : MOCK_PROCTOR.name,
                assignedInstructorId: exam.id === '2' ? '2' : MOCK_PROCTOR.id,
            })),
        [],
    );

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Instructor Assignment</h1>
                    <p className="text-muted-foreground">
                        Manage instructor assignments for examinations.
                    </p>
                </div>
                <Button className="bg-[#323d8f] text-white hover:bg-[#323d8f]/90">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Assign Instructor
                </Button>
            </div>

            <Separator />

            <ProctorAssignmentTable data={assignedExams} />
        </div>
    );
}

function GradingView() {
    return (
        <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <PageHeader
                title="Grading"
                description="Manage and grade student assessments."
                className="px-0"
            />
            <GradingList />
        </div>
    );
}

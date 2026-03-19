"use client";

import { useMemo, useState } from "react";
import { ExamCard, ExamCreateDialog, useProctorExams } from "@/features/exams";
import { type Exam } from "@sentinel/shared/types";
import { PageHeader } from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sentinel/ui";
import { Input, Button } from "@sentinel/ui";
import { Separator } from "@sentinel/ui";
import { Search, Plus, UserCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ProctorAssignmentTable } from "@/app/(protected)/(proctor)/exams/assignment/_components/assignment-table";
import { MOCK_PROCTOR, MOCK_PROCTOR_EXAMS } from "@sentinel/shared/constants";
import { GradingList } from "@/app/(protected)/(proctor)/exams/grading/_components/grading-list";

export default function ExamsDashboard() {
    const { exams, isLoading } = useProctorExams();
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const searchParams = useSearchParams();
    const view = searchParams.get("view");

    if (isLoading) {
        return <div className="flex items-center justify-center h-96">Loading exams...</div>;
    }

    if (view === "assign") {
        return <AssignmentView />;
    }

    if (view === "grade") {
        return <GradingView />;
    }

    const filteredExams = (exams || []).filter((e: Exam) =>
        e.title.toLowerCase().includes(search.toLowerCase())
    );

    const published = filteredExams.filter((e: Exam) => e.status === "published" || e.status === "active");
    const drafts = filteredExams.filter((e: Exam) => e.status === "draft");
    const archived = filteredExams.filter((e: Exam) => e.status === "archived");

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Exams"
                description="Create, organize, and monitor your examinations in one place."
            >
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4" /> Create Exam
                </Button>
                {/* TODO: Implement exam create dialog */}
                <ExamCreateDialog
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                />
            </PageHeader>

            <Separator />

            <div className="flex flex-col gap-4">
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search exams..."
                        className="pl-9 h-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Tabs defaultValue="all" className="space-y-4">
                    <TabsList className="bg-transparent border-b border-border/60 w-full justify-start h-auto p-0 rounded-none gap-4">
                        <TabsTrigger
                            value="all"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-0 border-b-2 border-transparent rounded-none px-1 pb-2 text-sm font-medium shadow-none data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        >
                            All <span className="ml-2 text-xs text-muted-foreground">({filteredExams.length})</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="published"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-0 border-b-2 border-transparent rounded-none px-1 pb-2 text-sm font-medium shadow-none data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        >
                            Published <span className="ml-2 text-xs text-muted-foreground">({published.length})</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="drafts"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-0 border-b-2 border-transparent rounded-none px-1 pb-2 text-sm font-medium shadow-none data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        >
                            Drafts <span className="ml-2 text-xs text-muted-foreground">({drafts.length})</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="archived"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary border-0 border-b-2 border-transparent rounded-none px-1 pb-2 text-sm font-medium shadow-none data-[state=active]:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        >
                            Archived <span className="ml-2 text-xs text-muted-foreground">({archived.length})</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="m-0">
                        {filteredExams.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredExams.map((exam: Exam) => (
                                    <ExamCard key={exam.id} exam={exam} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState search={search} />
                        )}
                    </TabsContent>

                    <TabsContent value="published" className="m-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {published.map((exam: Exam) => (
                                <ExamCard key={exam.id} exam={exam} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="drafts" className="m-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {drafts.map((exam: Exam) => (
                                <ExamCard key={exam.id} exam={exam} />
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="archived" className="m-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

function EmptyState({ search }: { search: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border/60 rounded-xl">
            <div className="h-12 w-12 rounded-full border border-border/60 flex items-center justify-center mb-4">
                <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium mb-1">No exams found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
                {search
                    ? `We couldn't find any exams matching "${search}". Try a different keyword.`
                    : "You haven't created any exams yet. Start by clicking the 'Create Exam' button."}
            </p>
        </div>
    );
}

function AssignmentView() {
    const assignedExams = useMemo(
        () =>
            MOCK_PROCTOR_EXAMS.map((exam) => ({
                ...exam,
                assignedProctor: exam.id === "2" ? "John Doe" : MOCK_PROCTOR.name,
                assignedProctorId: exam.id === "2" ? "2" : MOCK_PROCTOR.id,
            })),
        [],
    );

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Proctor Assignment</h1>
                    <p className="text-muted-foreground">
                        Manage proctor assignments for examinations.
                    </p>
                </div>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Assign Proctor
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

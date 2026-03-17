"use client";

import { useState } from "react";
import { ExamCard } from "./_components/ExamCard";
import { CreateExamDialog } from "./_components/CreateExamDialog";
import { mockExams } from "./_mock/exams";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sentinel/ui";
import { Search, LayoutGrid, LayoutList, Trophy } from "lucide-react";
import { Input } from "@sentinel/ui";
import { Separator } from "@sentinel/ui";

export default function ExamsDashboard() {
    const [exams] = useState(mockExams);
    const [search, setSearch] = useState("");

    const filteredExams = exams.filter(e => 
        e.title.toLowerCase().includes(search.toLowerCase())
    );

    const published = filteredExams.filter(e => e.status === "Published");
    const drafts = filteredExams.filter(e => e.status === "Draft");
    const archived = filteredExams.filter(e => e.status === "Archived");

    return (
        <div className="flex flex-col h-full bg-background/50">
            {/* Header section with stats or welcome message if needed */}
            <header className="p-8 pb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase">
                            <Trophy className="h-4 w-4" />
                            Sentinel Assessments
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
                            Exam Management
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            Create, organize, and monitor your examinations in one centralized dashboard.
                        </p>
                    </div>
                    <div>
                        <CreateExamDialog />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-card/30 backdrop-blur-md p-2 rounded-2xl border border-border/50 shadow-sm">
                    <div className="relative flex-1 w-full translate-x-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search exams by title..." 
                            className="pl-10 h-11 border-none bg-transparent focus-visible:ring-0 text-base"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Separator orientation="vertical" className="hidden sm:block h-8 opacity-50" />
                    <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-xl">
                        <Tabs defaultValue="grid" className="w-auto">
                            <TabsList className="h-9 bg-transparent p-0 gap-1">
                                <TabsTrigger value="grid" className="h-7 w-9 p-0 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <LayoutGrid className="h-4 w-4" />
                                </TabsTrigger>
                                <TabsTrigger value="list" className="h-7 w-9 p-0 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <LayoutList className="h-4 w-4" />
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8">
                <Tabs defaultValue="all" className="space-y-8">
                    <TabsList className="bg-transparent border-b border-border/50 w-full justify-start h-auto p-0 rounded-none gap-6">
                        <TabsTrigger 
                            value="all" 
                            className="data-[state=active]:bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-2 pb-3 font-bold text-base transition-all"
                        >
                            All Exams <span className="ml-2 text-xs opacity-50 font-normal">({filteredExams.length})</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="published" 
                            className="data-[state=active]:bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-2 pb-3 font-bold text-base transition-all"
                        >
                            Published <span className="ml-2 text-xs opacity-50 font-normal">({published.length})</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="drafts" 
                            className="data-[state=active]:bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-2 pb-3 font-bold text-base transition-all"
                        >
                            Drafts <span className="ml-2 text-xs opacity-50 font-normal">({drafts.length})</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="archived" 
                            className="data-[state=active]:bg-transparent data-[state=active]:border-primary border-b-2 border-transparent rounded-none px-2 pb-3 font-bold text-base transition-all"
                        >
                            Archived <span className="ml-2 text-xs opacity-50 font-normal">({archived.length})</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="m-0">
                        {filteredExams.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {filteredExams.map((exam) => (
                                    <ExamCard key={exam.id} exam={exam} onShare={() => {}} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState search={search} />
                        )}
                    </TabsContent>
                    
                    <TabsContent value="published" className="m-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {published.map((exam) => (
                                <ExamCard key={exam.id} exam={exam} onShare={() => {}} />
                            ))}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="drafts" className="m-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {drafts.map((exam) => (
                                <ExamCard key={exam.id} exam={exam} onShare={() => {}} />
                            ))}
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="archived" className="m-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {archived.map((exam) => (
                                <ExamCard key={exam.id} exam={exam} onShare={() => {}} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

function EmptyState({ search }: { search: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-full bg-secondary/30 flex items-center justify-center mb-6 border border-border/50">
                <Search className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold mb-2">No exams found</h3>
            <p className="text-muted-foreground max-w-sm">
                {search 
                    ? `We couldn't find any exams matching "${search}". Try a different keyword.`
                    : "You haven't created any exams yet. Start by clicking the 'Create Exam' button."}
            </p>
        </div>
    );
}

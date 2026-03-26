"use client";

import { PageHeader } from "@sentinel/ui";
import { Button, Separator, Badge } from "@sentinel/ui";
import { Plus, FolderPlus, MoreVertical, LayoutGrid, List, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ImportModal } from "../_components/import-modal";

import { useQuestionBank } from "@/features/questions/store/use-question-bank";

export default function CollectionsPage() {
    const [view, setView] = useState<"grid" | "list">("grid");
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const { collections } = useQuestionBank();

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4">
            <PageHeader
                title="Collections"
                description="Organize your question bank into reusable groups for easier exam building."
            >
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => setIsImportModalOpen(true)}
                        className="gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Import / Upload
                    </Button>
                    <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => toast.info("New Collection feature coming soon!")}
                    >
                        <FolderPlus className="w-4 h-4" />
                        New Collection
                    </Button>
                    <Button 
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white"
                        onClick={() => toast.info("Create Question flow coming soon!")}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Question
                    </Button>
                </div>
            </PageHeader>

            <Separator />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button 
                        variant={view === "grid" ? "secondary" : "ghost"} 
                        size="icon" 
                        onClick={() => setView("grid")}
                        className="h-9 w-9"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button 
                        variant={view === "list" ? "secondary" : "ghost"} 
                        size="icon" 
                        onClick={() => setView("list")}
                        className="h-9 w-9"
                    >
                        <List className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col gap-2"}>
                {collections.map((collection) => (
                    <div 
                        key={collection.id} 
                        className={`group bg-white dark:bg-zinc-900 border border-border hover:border-primary/40 hover:shadow-lg transition-all rounded-2xl p-4 cursor-pointer ${view === "list" ? "flex items-center justify-between" : "flex flex-col gap-4 h-full"}`}
                    >
                        <div className="flex items-start justify-between w-full">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <Database className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{collection.name}</h3>
                                    <p className="text-xs text-zinc-500">Updated {collection.lastUpdated}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                < MoreVertical className="w-4 h-4" />
                            </Button>
                        </div>

                        {view === "grid" && (
                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-none">
                                    {collection.questionIds.length} Questions
                                </Badge>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${collection.isPublic ? 'text-green-500' : 'text-zinc-400'}`}>
                                    {collection.isPublic ? 'Public' : 'Private'}
                                </span>
                            </div>
                        )}

                        {view === "list" && (
                            <div className="flex items-center gap-6">
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-none">
                                    {collection.questionIds.length} Questions
                                </Badge>
                                <Button variant="ghost" size="sm" className="h-8">Open</Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <ImportModal 
                open={isImportModalOpen} 
                onOpenChange={setIsImportModalOpen} 
            />
        </div>
    );
}

import { Database } from "lucide-react";

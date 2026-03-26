"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@sentinel/ui";
import { 
    Button, 
    Separator, 
    DataTable, 
    Input, 
    Label,
    Badge,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@sentinel/ui";
import { Save, ArrowLeft, CheckCircle2, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";

// Mock question type
interface PreviewQuestion {
    id: string;
    text: string;
    type: string;
    difficulty: "Easy" | "Medium" | "Hard";
    points: number;
}

const mockData: PreviewQuestion[] = [
    { id: "1", text: "What is the primary purpose of a 'useMemo' hook in React?", type: "MULTIPLE_CHOICE", difficulty: "Medium", points: 5 },
    { id: "2", text: "Explain the difference between '==' and '===' in JavaScript.", type: "SHORT_ANSWER", difficulty: "Easy", points: 3 },
    { id: "3", text: "TypeScript is a superset of JavaScript.", type: "TRUE_FALSE", difficulty: "Easy", points: 1 },
    { id: "4", text: "What is the time complexity of searching an element in a balanced Binary Search Tree?", type: "MULTIPLE_CHOICE", difficulty: "Hard", points: 10 },
    { id: "5", text: "Which lifecycle method is equivalent to useEffect with an empty dependency array?", type: "MULTIPLE_CHOICE", difficulty: "Medium", points: 5 },
    { id: "6", text: "What does the 'key' prop do in React during reconciliation?", type: "SHORT_ANSWER", difficulty: "Medium", points: 5 },
    { id: "7", text: "Is it possible to use hooks inside a regular JavaScript function?", type: "TRUE_FALSE", difficulty: "Easy", points: 1 },
];

const columns: ColumnDef<PreviewQuestion>[] = [
    {
        accessorKey: "text",
        header: "Question Text",
        cell: ({ row }) => <span className="font-medium">{row.original.text}</span>,
    },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
            <Badge variant="outline" className="capitalize whitespace-nowrap">
                {row.original.type.toLowerCase().replace("_", " ")}
            </Badge>
        ),
    },
    {
        accessorKey: "difficulty",
        header: "Difficulty",
        cell: ({ row }) => (
            <span className={`text-xs font-semibold ${
                row.original.difficulty === "Easy" ? "text-green-500" :
                row.original.difficulty === "Medium" ? "text-amber-500" : "text-red-500"
            }`}>
                {row.original.difficulty}
            </span>
        ),
    },
    {
        accessorKey: "points",
        header: "Points",
        cell: ({ row }) => <span className="whitespace-nowrap font-mono">{row.original.points} pts</span>,
    },
];

export default function ImportPreviewPage() {
    const router = useRouter();
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [collectionName, setCollectionName] = useState("New Collection - " + new Date().toLocaleDateString());
    const [collectionTags, setCollectionTags] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!collectionName.trim()) {
            toast.error("Collection name is required");
            return;
        }

        setIsSaving(true);
        // Simulate saving
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsSaving(false);
        setIsSaveModalOpen(false);

        toast.success("Saved to Collection", {
            description: `${mockData.length} questions have been added to "${collectionName}".`,
            icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        });

        router.push("/question/bank/collections");
    };

    return (
        <div className="flex flex-col gap-6 md:p-6 p-4 max-w-[1600px] mx-auto w-full">
            <div className="flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.back()}
                    className="gap-2 hover:bg-zinc-100"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Selection
                </Button>

                <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full">
                    <Info className="w-3.5 h-3.5" />
                    Review these questions before saving them to a new collection.
                </div>
            </div>

            <PageHeader
                title="Preview Questions"
                description={`Found ${mockData.length} questions from your import. Review the details below.`}
            >
                <div className="flex gap-2">
                    <Button
                        onClick={() => setIsSaveModalOpen(true)}
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white min-w-[160px] rounded-xl h-11"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save to Collection
                    </Button>
                </div>
            </PageHeader>

            <Separator />

            <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">Question List ({mockData.length})</h3>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 font-medium">
                        <span className="text-zinc-500">Total Points:</span>
                        <span className="text-[#323d8f]">{mockData.reduce((acc, q) => acc + q.points, 0)}</span>
                    </div>
                </div>
            </div>

            <DataTable 
                columns={columns} 
                data={mockData} 
                searchKey="text"
                searchPlaceholder="Filter questions..."
            />

            {/* Save Collection Modal */}
            <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Save className="w-5 h-5 text-primary" />
                            Finalize Collection
                        </DialogTitle>
                        <DialogDescription>
                            Organize these {mockData.length} questions into a new collection.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="collection-name" className="text-sm font-semibold">
                                Collection Name
                            </Label>
                            <Input
                                id="collection-name"
                                value={collectionName}
                                onChange={(e) => setCollectionName(e.target.value)}
                                placeholder="e.g. Midterm Software Engineering"
                                className="rounded-xl h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="collection-tags" className="text-sm font-semibold">
                                Tags / Category
                            </Label>
                            <Input
                                id="collection-tags"
                                value={collectionTags}
                                onChange={(e) => setCollectionTags(e.target.value)}
                                placeholder="e.g. React, JavaScript, Advanced"
                                className="rounded-xl h-11"
                            />
                            <p className="text-[10px] text-zinc-500 mt-1">
                                Separate multiple tags with commas.
                            </p>
                        </div>

                        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-border/50">
                            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Import Summary</h4>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-500">Total Questions</span>
                                <span className="font-semibold">{mockData.length}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-zinc-500">Total Points</span>
                                <span className="font-semibold">{mockData.reduce((acc, q) => acc + q.points, 0)} pts</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsSaveModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !collectionName.trim()}
                            className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white min-w-[120px] rounded-xl"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Confirm & Save"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

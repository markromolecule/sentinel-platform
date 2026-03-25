"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Button,
    Label,
    Textarea,
} from "@sentinel/ui";
import { Upload, Sparkles, FileText, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const MAX_FILE_SIZE_MB = 100;

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const sizeInMB = selectedFile.size / (1024 * 1024);
            if (sizeInMB > MAX_FILE_SIZE_MB) {
                toast.error("File too large", {
                    description: `Max file size is ${MAX_FILE_SIZE_MB}MB. Your file is ${sizeInMB.toFixed(2)}MB.`,
                });
                return;
            }

            const allowedExtensions = [".csv", ".xlsx", ".xls"];
            const extension = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();
            if (!allowedExtensions.includes(extension)) {
                toast.error("Invalid file type", {
                    description: `Allowed types: ${allowedExtensions.join(", ")}`,
                });
                return;
            }

            setFile(selectedFile);
            toast.success("File uploaded", {
                description: `${selectedFile.name} is ready for processing.`,
            });
        }
    };

    const handleContinue = async () => {
        if (activeTab === "upload" && !file) {
            toast.error("Please select a file first.");
            return;
        }
        if (activeTab === "ai" && !prompt.trim()) {
            toast.error("Please enter a prompt first.");
            return;
        }

        setIsProcessing(true);
        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsProcessing(false);

        onOpenChange(false);
        router.push("/question/bank/import-preview");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-width-[525px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Upload className="w-5 h-5 text-primary" />
                        Import / Upload Questions
                    </DialogTitle>
                    <DialogDescription>
                        Bulk upload questions using files or generate them using AI.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Bulk Upload
                        </TabsTrigger>
                        <TabsTrigger value="ai" className="flex items-center gap-2 text-[#323d8f]">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            Generative AI
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-4 py-4">
                        <div 
                            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${
                                file ? "border-green-500/50 bg-green-500/5" : "border-border hover:border-primary/50 hover:bg-zinc-50"
                            }`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".csv,.xlsx,.xls"
                                className="hidden"
                            />
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${file ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary"}`}>
                                {file ? <FileText className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-sm">
                                    {file ? file.name : "Click to upload or drag & drop"}
                                </p>
                                <p className="text-xs text-zinc-500 mt-1">
                                    CSV, XLSX, or XLS (Max 100MB)
                                </p>
                            </div>
                        </div>
                        {file && (
                            <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-100 p-2 rounded-md">
                                <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Note: Preview will be available on the next step.</span>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="ai" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="ai-prompt" className="text-sm font-semibold">
                                Describe your questions
                            </Label>
                            <Textarea
                                id="ai-prompt"
                                placeholder="Example: Create 5 multiple-choice questions about software engineering principles for a mid-level developer interview..."
                                className="min-h-[120px] resize-none"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <p className="text-xs text-zinc-500 italic">
                                Our AI will draft questions based on your description.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white min-w-[120px]"
                        onClick={handleContinue}
                        disabled={isProcessing || (activeTab === "upload" && !file) || (activeTab === "ai" && !prompt.trim())}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Continue"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

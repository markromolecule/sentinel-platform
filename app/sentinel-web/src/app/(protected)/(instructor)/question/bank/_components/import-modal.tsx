"use client";

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
} from "@sentinel/ui";
import { Upload, Sparkles, FileText, Loader2 } from "lucide-react";
import { useImportHandler } from "@/app/(protected)/(instructor)/question/bank/_components/import-modal/_hooks/use-import-handler";
import {
    UploadTab,
    AiTab,
} from "@/app/(protected)/(instructor)/question/bank/_components/import-modal/_components/";
import { ImportModalProps } from "@/app/(protected)/(instructor)/question/bank/_components/import-modal/_types";

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
    const {
        activeTab,
        setActiveTab,
        file,
        prompt,
        setPrompt,
        isProcessing,
        handleFileChange,
        handleContinue,
    } = useImportHandler(onOpenChange);

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

                    <TabsContent value="upload">
                        <UploadTab file={file} onFileChange={handleFileChange} />
                    </TabsContent>

                    <TabsContent value="ai">
                        <AiTab prompt={prompt} onPromptChange={setPrompt} />
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

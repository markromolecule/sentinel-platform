"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
} from "@sentinel/ui";
import { Upload, Loader2, Settings2, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useImportHandler } from "@/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/use-import-handler";
import {
    UploadTab,
    ConfigureStep,
} from "@/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_components/";
import { ImportModalProps } from "@/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_types";

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
    const {
        currentStep,
        file,
        isProcessing,
        questionCount,
        setQuestionCount,
        selectedTypes,
        setSelectedTypes,
        handleFileChange,
        handleAnalyze,
        handleGenerate,
        handleBack,
    } = useImportHandler(onOpenChange);

    const isUploadStep = currentStep === 'upload';
    const isConfigureStep = currentStep === 'configure';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        {isUploadStep ? (
                            <>
                                <Upload className="w-6 h-6 text-[#323d8f]" />
                                <span>Import Questions</span>
                            </>
                        ) : (
                            <>
                                <Settings2 className="w-6 h-6 text-[#323d8f]" />
                                <span>Configure Generation</span>
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        {isUploadStep
                            ? "Upload a PDF, CSV, or Excel file to analyze and extract questions."
                            : "Specify how you want the questions to be generated from your file."}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6">
                    {isUploadStep ? (
                        <UploadTab file={file} onFileChange={handleFileChange} />
                    ) : (
                        <ConfigureStep
                            questionCount={questionCount}
                            setQuestionCount={setQuestionCount}
                            selectedTypes={selectedTypes}
                            setSelectedTypes={setSelectedTypes}
                        />
                    )}
                </div>

                <DialogFooter className="mt-8 flex justify-between sm:justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                        {isConfigureStep && (
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                disabled={isProcessing}
                                className="gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>

                        {isUploadStep ? (
                            <Button
                                className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white min-w-[140px] gap-2"
                                onClick={handleAnalyze}
                                disabled={isProcessing || !file}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Analyze File
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white min-w-[160px] gap-2"
                                onClick={handleGenerate}
                                disabled={isProcessing || selectedTypes.length === 0}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 text-amber-400" />
                                        Generate Questions
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

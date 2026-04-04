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
import { Upload, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { useImportHandler } from "@/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_hooks/use-import-handler";
import {
    UploadTab,
    ConfigureStep,
} from "@/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_components/";
import { ImportModalProps } from "@/app/(protected)/(instructor)/question/bank/_components/dialogs/import-modal/_types";

export function ImportModal({ open, onOpenChange, collectionId, collectionName }: ImportModalProps) {
    const {
        currentStep,
        files,
        isProcessing,
        questionCount,
        questionTypeDistribution,
        handleToggleType,
        handleTypeCountChange,
        handleFileChange,
        handleAnalyze,
        handleGenerate,
        handleBack,
    } = useImportHandler({
        onOpenChange,
        collectionId,
        collectionName,
    });

    const isUploadStep = currentStep === 'upload';
    const isConfigureStep = currentStep === 'configure';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-[860px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Upload className="w-5 h-5 text-[#323d8f]" />
                        <span>{isUploadStep ? "Import Questions" : "Configure Generation"}</span>
                    </DialogTitle>
                    <DialogDescription className="mt-1.5">
                        {isUploadStep
                            ? "Upload one or more PDF lesson files for AI analysis."
                            : "Choose the question types and counts to include in the generated preview."}
                    </DialogDescription>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Step {isUploadStep ? '1' : '2'} of 2
                    </p>
                </DialogHeader>

                <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
                    {isUploadStep ? (
                        <UploadTab files={files} onFileChange={handleFileChange} />
                    ) : (
                        <ConfigureStep
                            filesCount={files.length}
                            questionCount={questionCount}
                            questionTypeDistribution={questionTypeDistribution}
                            onToggleType={handleToggleType}
                            onTypeCountChange={handleTypeCountChange}
                            isProcessing={isProcessing}
                        />
                    )}
                </div>

                <DialogFooter className="mt-6 flex w-full items-center justify-between sm:justify-between">
                    <div className="flex items-center gap-2">
                        {isConfigureStep && (
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                disabled={isProcessing}
                                size="sm"
                                className="h-8 gap-1.5 px-2.5"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Back
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isProcessing}
                            size="sm"
                            className="h-8 px-3"
                        >
                            Cancel
                        </Button>

                        {isUploadStep ? (
                            <Button
                                size="sm"
                                className="h-8 min-w-[116px] gap-1.5 bg-[#323d8f] px-3 text-white hover:bg-[#323d8f]/90"
                                onClick={handleAnalyze}
                                disabled={isProcessing || files.length === 0}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Preparing...
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                className="h-8 min-w-[132px] gap-1.5 bg-[#323d8f] px-3 text-white hover:bg-[#323d8f]/90"
                                onClick={handleGenerate}
                                disabled={isProcessing || questionTypeDistribution.length === 0 || questionCount === 0}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>Generate Questions</>
                                )}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

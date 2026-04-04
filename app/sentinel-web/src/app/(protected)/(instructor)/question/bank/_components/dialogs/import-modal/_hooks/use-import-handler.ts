'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { parseQuestionImportFile } from '@/app/(protected)/(instructor)/question/bank/import/_lib/parse-question-import-file';
import { saveQuestionImportDraft } from '@/app/(protected)/(instructor)/question/bank/import/_lib/draft-storage';

const MAX_FILE_SIZE_MB = 100;

export type ImportStep = 'upload' | 'configure';

export function useImportHandler(onOpenChange: (open: boolean) => void) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Configuration states
    const [questionCount, setQuestionCount] = useState<number>(10);
    const [selectedTypes, setSelectedTypes] = useState<string[]>(['MULTIPLE_CHOICE']);

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile) {
            const sizeInMB = selectedFile.size / (1024 * 1024);
            if (sizeInMB > MAX_FILE_SIZE_MB) {
                toast.error('File too large', {
                    description: `Max file size is ${MAX_FILE_SIZE_MB}MB. Your file is ${sizeInMB.toFixed(2)}MB.`,
                });
                return;
            }

            const allowedExtensions = ['.csv', '.xlsx', '.xls', '.pdf'];
            const extension = selectedFile.name
                .substring(selectedFile.name.lastIndexOf('.'))
                .toLowerCase();
            if (!allowedExtensions.includes(extension)) {
                toast.error('Invalid file type', {
                    description: `Allowed types: ${allowedExtensions.join(', ')}`,
                });
                return;
            }

            setFile(selectedFile);
            toast.success('File uploaded', {
                description: `${selectedFile.name} is ready for analysis.`,
            });
        }
    };

    const handleAnalyze = async () => {
        if (!file) {
            toast.error('Please select a file first.');
            return;
        }

        setIsProcessing(true);
        // Mock analysis delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsProcessing(false);
        
        setCurrentStep('configure');
        toast.success('Analysis complete!', {
            description: 'Please configure your question generation settings.',
        });
    };

    const handleGenerate = async () => {
        setIsProcessing(true);
        
        try {
            // If it's a spreadsheet, we might still want the old parse logic 
            // but for this flow we are prioritizing the visual redirect.
            if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
                 const draft = await parseQuestionImportFile(file);
                 saveQuestionImportDraft(draft);
            }

            // Mock generation delay
            await new Promise((resolve) => setTimeout(resolve, 2000));
            
            toast.success('Questions generated successfully!', {
                description: `Created ${questionCount} questions for preview.`,
            });

            onOpenChange(false);
            router.push('/question/bank/import/preview');
        } catch (error) {
            toast.error('Unable to generate questions.', {
                description: error instanceof Error ? error.message : 'Please try again.',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBack = () => {
        setCurrentStep('upload');
    };

    return {
        currentStep,
        setCurrentStep,
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
    };
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { parseQuestionImportFile } from '@/app/(protected)/(instructor)/question/bank/import/_lib/parse-question-import-file';
import { saveQuestionImportDraft } from '@/app/(protected)/(instructor)/question/bank/import/_lib/draft-storage';

const MAX_FILE_SIZE_MB = 100;

export function useImportHandler(onOpenChange: (open: boolean) => void) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile) {
            const sizeInMB = selectedFile.size / (1024 * 1024);
            if (sizeInMB > MAX_FILE_SIZE_MB) {
                toast.error('File too large', {
                    description: `Max file size is ${MAX_FILE_SIZE_MB}MB. Your file is ${sizeInMB.toFixed(2)}MB.`,
                });
                return;
            }

            const allowedExtensions = ['.csv', '.xlsx', '.xls'];
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
                description: `${selectedFile.name} is ready for processing.`,
            });
        }
    };

    const handleContinue = async () => {
        if (activeTab === 'upload' && !file) {
            toast.error('Please select a file first.');
            return;
        }
        if (activeTab === 'ai' && !prompt.trim()) {
            toast.error('Please enter a prompt first.');
            return;
        }

        setIsProcessing(true);

        try {
            if (activeTab === 'upload' && file) {
                const draft = await parseQuestionImportFile(file);
                saveQuestionImportDraft(draft);

                toast.success('Import preview is ready.', {
                    description:
                        draft.warnings.length > 0
                            ? `${draft.questions.length} questions parsed, ${draft.warnings.length} row(s) skipped.`
                            : `${draft.questions.length} questions parsed from ${file.name}.`,
                });

                setFile(null);
                setPrompt('');
                setActiveTab('upload');
                onOpenChange(false);
                router.push('/question/bank/import/preview');
                return;
            }

            toast.info('AI question drafting is not connected to a backend workflow yet. Use bulk upload for now.');
        } catch (error) {
            toast.error('Unable to prepare import preview.', {
                description: error instanceof Error ? error.message : 'Please review the file format and try again.',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        activeTab,
        setActiveTab,
        file,
        prompt,
        setPrompt,
        isProcessing,
        handleFileChange,
        handleContinue,
    };
}

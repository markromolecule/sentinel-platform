'use client';

import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { cn } from '@sentinel/ui';
import { Button } from '@sentinel/ui';

type EnrollmentDropzoneProps = {
    onFileSelectAction: (file: File) => void;
};

export function EnrollmentDropzone({ onFileSelectAction }: EnrollmentDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);

            const droppedFile = e.dataTransfer.files[0];
            if (
                droppedFile &&
                (droppedFile.name.endsWith('.csv') ||
                    droppedFile.name.endsWith('.xlsx') ||
                    droppedFile.name.endsWith('.xls'))
            ) {
                onFileSelectAction(droppedFile);
            }
        },
        [onFileSelectAction],
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            onFileSelectAction(selectedFile);
        }
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
                'rounded-xl border-2 border-dashed p-8 text-center transition-colors',
                isDragging
                    ? 'border-[#323d8f] bg-[#323d8f]/5'
                    : 'border-border hover:border-[#323d8f]/50',
            )}
        >
            <div className="flex flex-col items-center gap-4">
                <div className="bg-muted rounded-full p-4">
                    <Upload className="text-muted-foreground h-8 w-8" />
                </div>
                <div>
                    <p className="text-foreground text-sm font-medium">
                        Drag and drop your file here
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">or click to browse</p>
                </div>
                <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                />
                <Button asChild variant="outline">
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Select File
                    </label>
                </Button>
                <p className="text-muted-foreground text-xs">Supported formats: CSV, XLSX, XLS</p>
            </div>
        </div>
    );
}

"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";

interface UploadTabProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
}

export function UploadTab({ file, onFileChange }: UploadTabProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);

            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) {
                onFileChange(droppedFile);
            }
        },
        [onFileChange]
    );

    return (
        <div className="space-y-4 py-2">
            <div
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${
                    file || isDragging
                    ? "border-[#323d8f] bg-[#323d8f]/5" 
                    : "border-border hover:border-[#323d8f]/50 hover:bg-zinc-50"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                    accept=".csv,.xlsx,.xls,.pdf"
                    className="hidden"
                />
                <div className={`h-16 w-16 rounded-full flex items-center justify-center transition-transform ${
                    file ? "bg-[#323d8f] text-white scale-110 shadow-lg" : "bg-primary/10 text-[#323d8f]"
                }`}>
                    {file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>
                <div className="text-center">
                    <p className={`font-bold text-base ${file ? "text-[#323d8f]" : "text-foreground"}`}>
                        {file ? file.name : "Choose a file or drag it here"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 max-w-[250px] mx-auto leading-relaxed">
                        We support <span className="font-medium text-foreground">PDF, CSV, XLSX, or XLS</span> files up to 100MB.
                    </p>
                </div>
            </div>
            
            {file ? (
                <div className="flex items-center gap-3 text-sm text-[#323d8f] bg-[#323d8f]/10 p-4 rounded-xl border border-[#323d8f]/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="font-medium">
                        System is ready! Click <span className="font-bold underline">Analyze File</span> to extract questions.
                    </p>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Selected file will be analyzed before configuration.</span>
                </div>
            )}
        </div>
    );
}

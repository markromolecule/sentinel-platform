"use client";

import { useRef } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";

interface UploadTabProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
}

export function UploadTab({ file, onFileChange }: UploadTabProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-4 py-4">
            <div
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${file ? "border-green-500/50 bg-green-500/5" : "border-border hover:border-primary/50 hover:bg-zinc-50"
                    }`}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => onFileChange(e.target.files?.[0] || null)}
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
        </div>
    );
}

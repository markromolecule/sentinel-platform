import { type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@sentinel/ui';
import { Upload } from 'lucide-react';
import { cn } from '@sentinel/ui';

export type DropZoneProps = {
    isScopeReady: boolean;
    isDragActive: boolean;
    onDragOver: (event: DragEvent<HTMLDivElement>) => void;
    onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
    onDrop: (event: DragEvent<HTMLDivElement>) => void;
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

/**
 * Renders the drag-and-drop file upload area and browse button.
 */
export function DropZone({
    isScopeReady,
    isDragActive,
    onDragOver,
    onDragLeave,
    onDrop,
    onFileChange,
}: DropZoneProps) {
    return (
        <div
            className={cn(
                'border-border bg-muted/30 rounded-xl border-2 border-dashed p-12 text-center transition-colors flex flex-col items-center justify-center min-h-[450px]',
                isScopeReady && 'hover:border-[#323d8f]/50',
                isDragActive && 'border-[#323d8f] bg-[#323d8f]/5',
            )}
            onDragOver={onDragOver}
            onDragEnter={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div className="flex flex-col items-center gap-4">
                <div className="bg-background border-border rounded-full border p-4 shadow-sm">
                    <Upload className="h-8 w-8 text-[#323d8f]" />
                </div>
                <div>
                    <p className="text-foreground text-sm font-medium">
                        Click to browse or drag and drop
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                        CSV, XLSX, or XLS files allowed
                    </p>
                </div>
                <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={onFileChange}
                    className="hidden"
                    id="student-whitelist-bulk-upload"
                    disabled={!isScopeReady}
                />
                <Button
                    asChild
                    size="sm"
                    className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                    disabled={!isScopeReady}
                >
                    <label
                        htmlFor="student-whitelist-bulk-upload"
                        className={cn(
                            'cursor-pointer',
                            !isScopeReady && 'cursor-not-allowed',
                        )}
                    >
                        Select File
                    </label>
                </Button>
                {!isScopeReady && (
                    <p className="text-muted-foreground text-xs">
                        Select the whitelist scope before uploading a file.
                    </p>
                )}
            </div>
        </div>
    );
}

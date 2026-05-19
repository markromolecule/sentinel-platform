import { Button } from '@sentinel/ui';
import { FileSpreadsheet, Loader2, X } from 'lucide-react';

export type FilePreviewProps = {
    file: File;
    isImporting: boolean;
    isParsing: boolean;
    onReset: () => void;
};

/**
 * Renders the preview card for the uploaded file and loading state during CSV/Excel analysis.
 */
export function FilePreview({
    file,
    isImporting,
    isParsing,
    onReset,
}: FilePreviewProps) {
    return (
        <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-[#323d8f]/20 bg-[#323d8f]/5 p-3">
                <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-[#323d8f]" />
                    <div>
                        <p className="text-foreground max-w-[300px] truncate text-sm font-medium">
                            {file.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                            {(file.size / 1024).toFixed(1)} KB
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onReset}
                    disabled={isImporting}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {isParsing && (
                <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#323d8f]" />
                    <p className="text-sm">Analyzing file content...</p>
                </div>
            )}
        </div>
    );
}

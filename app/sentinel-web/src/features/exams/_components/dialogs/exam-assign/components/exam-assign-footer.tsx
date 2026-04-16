import { Button } from '@sentinel/ui';

interface ExamAssignFooterProps {
    selectedCount: number;
    hasActiveFilters: boolean;
    onReset: () => void;
    onCancel: () => void;
    onAssign: () => void;
}

export function ExamAssignFooter({
    selectedCount,
    hasActiveFilters,
    onReset,
    onCancel,
    onAssign,
}: ExamAssignFooterProps) {
    return (
        <div className="space-y-4">
            <div className="text-muted-foreground flex items-center justify-between px-1 text-sm">
                <span>{selectedCount} students selected</span>
                {(selectedCount > 0 || hasActiveFilters) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs hover:bg-transparent"
                        onClick={onReset}
                    >
                        Reset Filters & Selection
                    </Button>
                )}
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    onClick={onAssign}
                    className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                    disabled={selectedCount === 0}
                >
                    Assign Exam
                </Button>
            </div>
        </div>
    );
}

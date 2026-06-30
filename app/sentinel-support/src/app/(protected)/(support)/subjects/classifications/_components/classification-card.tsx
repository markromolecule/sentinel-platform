import { Badge, Button, Card, CardDescription, CardTitle } from '@sentinel/ui';
import { Edit2, PackagePlus, Trash2 } from 'lucide-react';
import { SubjectClassification } from '@sentinel/shared/types';
import {
    OriginStatusBadge,
    getOriginStatusLabel,
} from '@/app/(protected)/(support)/_components/origin-status-badge';

export type ClassificationCardProps = {
    classification: SubjectClassification;
    canOffer: boolean;
    canEdit: boolean;
    canDelete: boolean;
    onOffer: (classification: SubjectClassification) => void;
    onEdit: (classification: SubjectClassification) => void;
    onDelete: (classification: SubjectClassification) => void;
};

/**
 * ClassificationCard displays the summary of a Subject Classification,
 * including its assigned subjects, type, origin status, and quick action buttons.
 */
export function ClassificationCard({
    classification,
    canOffer,
    canEdit,
    canDelete,
    onOffer,
    onEdit,
    onDelete,
}: ClassificationCardProps) {
    const previewSubjects = classification.subjects.slice(0, 3);
    const remainingCount = Math.max(classification.subjectCount - previewSubjects.length, 0);
    const isInheritedClassification = getOriginStatusLabel(classification) === 'Inherited';

    const isGeneral = classification.type === 'GENERAL';
    const typeBadgeClassName = isGeneral
        ? 'border-indigo-200/60 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/40'
        : 'border-violet-200/60 bg-violet-50/50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/40';

    return (
        <Card className="border-border/60 hover:border-border/80 group relative flex h-full min-h-[120px] min-w-0 flex-col overflow-hidden py-0 shadow-xs transition-all duration-200 hover:shadow-md">
            <div className="flex min-w-0 flex-1 flex-col px-4 pt-3.5 pb-3.5">
                <div className="min-w-0 space-y-1 pr-20">
                    <CardTitle className="text-foreground line-clamp-1 text-base leading-tight font-bold tracking-tight">
                        {classification.name}
                    </CardTitle>
                    {classification.description && (
                        <CardDescription className="line-clamp-1 pt-0.5 text-[11px] leading-none">
                            {classification.description}
                        </CardDescription>
                    )}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge
                        variant="outline"
                        className={`h-5 px-2 text-[9px] font-semibold tracking-wider uppercase ${typeBadgeClassName}`}
                    >
                        {isGeneral ? 'General' : 'Core'}
                    </Badge>
                    <OriginStatusBadge record={classification} />
                </div>

                <hr className="border-border/30 my-3" />

                {previewSubjects.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                        {previewSubjects.map((subject) => (
                            <span
                                key={subject.id}
                                className="bg-secondary/60 text-foreground border-border/20 flex h-[22px] max-w-[90px] items-center justify-center truncate rounded border px-2 text-[11px] leading-none font-medium"
                            >
                                {subject.code}
                            </span>
                        ))}
                        {remainingCount > 0 && (
                            <span className="border-border text-muted-foreground flex h-[22px] items-center justify-center rounded border border-dashed bg-transparent px-2 text-[11px] leading-none font-normal">
                                + {remainingCount} more
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="text-muted-foreground/60 text-[10px] italic">
                        No subjects assigned
                    </div>
                )}

                <div className="border-border/30 mt-3.5 flex min-w-0 items-center justify-between border-t pt-2.5">
                    <span className="text-muted-foreground truncate text-[10px] leading-none font-semibold tracking-wider uppercase">
                        {classification.subjectCount} Subject
                        {classification.subjectCount === 1 ? '' : 's'}
                    </span>
                    <span className="text-muted-foreground/80 truncate text-[9px] leading-none font-medium tracking-wider uppercase">
                        {isGeneral ? 'Cross-program' : 'Department-linked'}
                    </span>
                </div>
            </div>

            <div className="border-border/40 bg-muted/20 absolute top-3 right-3 flex items-center gap-1 rounded-lg border p-0.5 opacity-100 transition-opacity focus-within:opacity-100 md:opacity-0 md:group-hover:opacity-100">
                {canOffer && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-background/95 hover:bg-background text-muted-foreground hover:text-foreground h-7 w-7 rounded-md shadow-xs backdrop-blur-xs"
                        disabled={classification.subjectCount === 0}
                        onClick={() => onOffer(classification)}
                        title="Offer subjects"
                    >
                        <PackagePlus className="h-3.5 w-3.5" />
                    </Button>
                )}
                {canEdit && !isInheritedClassification && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-background/95 hover:bg-background text-muted-foreground hover:text-foreground h-7 w-7 rounded-md shadow-xs backdrop-blur-xs"
                        onClick={() => onEdit(classification)}
                        title="Edit classification"
                    >
                        <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                )}
                {canDelete && !isInheritedClassification && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-background/95 hover:bg-destructive/10 text-destructive/90 hover:text-destructive h-7 w-7 rounded-md border-transparent shadow-xs backdrop-blur-xs"
                        onClick={() => onDelete(classification)}
                        title="Delete classification"
                    >
                        <Trash2 className="text-destructive h-3.5 w-3.5" />
                    </Button>
                )}
            </div>
        </Card>
    );
}

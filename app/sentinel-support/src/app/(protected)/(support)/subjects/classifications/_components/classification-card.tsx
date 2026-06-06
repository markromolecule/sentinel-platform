import { Badge, Button, Card, CardContent } from '@sentinel/ui';
import { PackagePlus, Pencil, Trash2 } from 'lucide-react';
import { SubjectClassification } from '@sentinel/shared/types';
import {
    OriginStatusBadge,
    getOriginStatusLabel,
} from '@/app/(protected)/(support)/_components/origin-status-badge';

export type ClassificationCardProps = {
    classification: SubjectClassification;
    institutionName?: string | null;
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
    institutionName,
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
        <Card className="border-border/60 hover:border-border/80 flex h-full flex-col overflow-hidden shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md py-0">
            <CardContent className="flex flex-1 flex-col gap-3 pt-3.5 pb-3.5 px-4">
                {/* Header section with Title and Actions */}
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                        <h3 className="text-base font-bold leading-tight tracking-tight text-foreground line-clamp-2">
                            {classification.name}
                        </h3>
                        <p className="text-muted-foreground text-[11px] font-medium leading-none">
                            <span className="truncate">{institutionName ?? 'Unknown institution'}</span>
                        </p>
                    </div>

                    {/* Action buttons with ghost/icon styling */}
                    <div className="flex items-center gap-0.5 shrink-0 rounded-lg border border-border/40 bg-muted/20 p-0.5">
                        {canOffer && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                                disabled={classification.subjectCount === 0}
                                onClick={() => onOffer(classification)}
                                title="Offer subjects"
                            >
                                <PackagePlus className="h-4 w-4" />
                            </Button>
                        )}
                        {canEdit && !isInheritedClassification && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                                onClick={() => onEdit(classification)}
                                title="Edit classification"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        )}
                        {canDelete && !isInheritedClassification && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => onDelete(classification)}
                                title="Delete classification"
                            >
                                <Trash2 className="h-4 w-4 text-destructive/90" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Metadata badges (Type & Origin Status) */}
                <div className="flex flex-wrap gap-1.5">
                    <Badge
                        variant="outline"
                        className={`h-5 px-2 text-[10px] font-semibold tracking-wider uppercase ${typeBadgeClassName}`}
                    >
                        {classification.type}
                    </Badge>
                    <OriginStatusBadge record={classification} />
                </div>

                <hr className="border-border/30 my-0.5" />

                {/* Subjects Section */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/80">
                            Subjects ({classification.subjectCount})
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {previewSubjects.length > 0 ? (
                            <>
                                {previewSubjects.map((subject) => (
                                    <span
                                        key={subject.id}
                                        className="bg-secondary/60 hover:bg-secondary/80 text-[11px] font-medium leading-none px-2 rounded-md text-foreground border border-border/20 h-[22px] flex items-center justify-center"
                                    >
                                        {subject.code}
                                    </span>
                                ))}
                                {remainingCount > 0 && (
                                    <span
                                        className="bg-transparent text-[11px] font-normal px-2 rounded-md border border-dashed border-border/80 text-muted-foreground h-[22px] flex items-center justify-center leading-none"
                                    >
                                        + {remainingCount} more
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="text-xs text-muted-foreground/60 italic">
                                No subjects assigned
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

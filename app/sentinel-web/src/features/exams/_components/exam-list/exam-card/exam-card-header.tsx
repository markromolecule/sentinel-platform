import {
    CardHeader,
    CardTitle,
    CardDescription,
    Badge,
    Button,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@sentinel/ui";
import { MoreHorizontal, Eye, Share2, Trash2 } from "lucide-react";
import { ExamCardProps } from "@sentinel/shared/types";
import { useRouter } from "next/navigation";

interface ExamCardHeaderProps {
    exam: ExamCardProps["exam"];
    statusClass: string;
    onDeleteClick: () => void;
    onPreviewClick: () => void;
}

export function ExamCardHeader({ exam, statusClass, onDeleteClick, onPreviewClick }: ExamCardHeaderProps) {
    const router = useRouter();

    const handleShare = () => {
        router.push(`/exams/assignment`);
    };

    return (
        <CardHeader className="gap-3 pb-2">
            <div className="flex items-start justify-between gap-3">
                <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${statusClass}`}>
                    {exam.status}
                </Badge>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuItem onClick={onPreviewClick} className="cursor-pointer font-medium text-primary">
                            <Eye className="mr-2 h-4 w-4" />
                            Preview Exam
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                            <Share2 className="mr-2 h-4 w-4" />
                            Share / Assign
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={onDeleteClick} className="text-red-500 cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Exam
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <CardTitle className="text-base font-semibold tracking-tight line-clamp-1" title={exam.title}>
                {exam.title}
            </CardTitle>
            {exam.description && (
                <CardDescription className="line-clamp-2 text-sm break-words">
                    {exam.description}
                </CardDescription>
            )}
        </CardHeader>
    );
}

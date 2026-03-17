"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@sentinel/ui";
import { Badge } from "@sentinel/ui";
import { Button } from "@sentinel/ui";
import { Share2, Pencil, Calendar } from "lucide-react";
import type { Exam } from "../types";
import { format } from "date-fns";
import Link from "next/link";

interface ExamCardProps {
    exam: Exam;
    onShare: (exam: Exam) => void;
}

export const ExamCard = ({ exam, onShare }: ExamCardProps) => {
    const statusColor = {
        Published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
        Draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
        Archived: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    };

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col h-full">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                    <Badge variant="outline" className={`${statusColor[exam.status]} font-semibold`}>
                        {exam.status}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => onShare(exam)}
                        >
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <CardTitle className="line-clamp-2 text-xl font-bold mt-2 group-hover:text-primary transition-colors">
                    {exam.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                    {exam.description || "No description provided."}
                </p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(exam.createdAt), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                        <span className="font-semibold text-foreground">{exam.questions.length}</span> Questions
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/50 bg-secondary/20">
                <Button asChild className="w-full group/btn" variant="default">
                    <Link href={`/exams/builder?id=${exam.id}`} className="flex items-center justify-center gap-2">
                        <Pencil className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        Manage Exam
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};
